#!/usr/bin/env python3
"""Build an audited v783 neuron-sign table from official site-level transmitter predictions.

The source table remains outside this repository. For each proofread presynaptic
root ID, this follows Shiu et al.: choose the highest transmitter at each
cleft_score >= 50 site and classify the neuron inhibitory only when strictly
more than half of its sites are GABA or glutamate. All other classified neurons
are excitatory; roots without qualifying presynaptic sites remain unclassified.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
import tempfile
from pathlib import Path
from typing import Any, Iterable

import numpy as np
import pyarrow as pa
import pyarrow.ipc as ipc


PROJECT_ROOT = Path(__file__).resolve().parents[2]
NT_COLUMNS = ("gaba", "ach", "glut", "oct", "ser", "da")
INHIBITORY_WINNERS = {0, 2}
CLEFT_SCORE_CUTOFF = 50.0


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(8 * 1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def inside(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def iter_batches(path: Path) -> Iterable[pa.RecordBatch]:
    source = pa.memory_map(str(path), "r")
    reader = ipc.open_file(source)
    required = {"pre_pt_root_id", "cleft_score", *NT_COLUMNS}
    missing = required - set(reader.schema.names)
    if missing:
        raise ValueError(f"Site-level table misses required columns: {', '.join(sorted(missing))}")
    for index in range(reader.num_record_batches):
        yield reader.get_batch(index)


def aggregate(root_ids: np.ndarray, batches: Iterable[pa.RecordBatch]) -> tuple[np.ndarray, np.ndarray]:
    if root_ids.ndim != 1 or not np.issubdtype(root_ids.dtype, np.integer):
        raise ValueError("Root ID file must be a one-dimensional integer array.")
    roots = root_ids.astype(np.uint64, copy=False)
    sort_order = np.argsort(roots)
    sorted_roots = roots[sort_order]
    total_sites = np.zeros(roots.size, dtype=np.uint32)
    inhibitory_sites = np.zeros(roots.size, dtype=np.uint32)
    for batch in batches:
        schema = {name: index for index, name in enumerate(batch.schema.names)}
        pre = batch.column(schema["pre_pt_root_id"]).to_numpy(zero_copy_only=False).astype(np.uint64, copy=False)
        cleft = batch.column(schema["cleft_score"]).to_numpy(zero_copy_only=False).astype(np.float32, copy=False)
        positions = np.searchsorted(sorted_roots, pre)
        matched = (positions < sorted_roots.size) & (sorted_roots[np.minimum(positions, sorted_roots.size - 1)] == pre) & (cleft >= CLEFT_SCORE_CUTOFF)
        if not np.any(matched):
            continue
        transmitter = np.stack(
            [batch.column(schema[name]).to_numpy(zero_copy_only=False).astype(np.float32, copy=False) for name in NT_COLUMNS],
            axis=1,
        )
        original_indices = sort_order[positions[matched]]
        winners = np.argmax(transmitter[matched], axis=1)
        np.add.at(total_sites, original_indices, 1)
        inhibitory_indices = original_indices[np.isin(winners, list(INHIBITORY_WINNERS))]
        np.add.at(inhibitory_sites, inhibitory_indices, 1)
    return total_sites, inhibitory_sites


def write_output(output_dir: Path, root_ids: np.ndarray, total_sites: np.ndarray, inhibitory_sites: np.ndarray, provenance: dict[str, Any]) -> dict[str, Any]:
    if output_dir.exists() and any(output_dir.iterdir()):
        raise ValueError(f"Output directory must be empty: {output_dir}")
    output_dir.mkdir(parents=True, exist_ok=True)
    try:
        signs = np.where(total_sites == 0, 0, np.where(inhibitory_sites * 2 > total_sites, -1, 1)).astype("<i4", copy=False)
        paths = {
            "root_id": output_dir / "root-id.u64.bin",
            "total_presynaptic_sites": output_dir / "total-presynaptic-sites.u32.bin",
            "inhibitory_presynaptic_sites": output_dir / "inhibitory-presynaptic-sites.u32.bin",
            "neuron_sign": output_dir / "neuron-sign.i32.bin",
        }
        root_ids.astype("<u8", copy=False).tofile(paths["root_id"])
        total_sites.astype("<u4", copy=False).tofile(paths["total_presynaptic_sites"])
        inhibitory_sites.astype("<u4", copy=False).tofile(paths["inhibitory_presynaptic_sites"])
        signs.tofile(paths["neuron_sign"])
        counts = {"excitatory": int(np.count_nonzero(signs == 1)), "inhibitory": int(np.count_nonzero(signs == -1)), "unclassified": int(np.count_nonzero(signs == 0))}
        manifest = {
            "format": "DFLY-NEURON-SIGN",
            "formatVersion": 1,
            "datasetId": "flywire-v783-site-level-neuron-sign",
            "release": "783",
            "neuronCount": int(root_ids.size),
            "classificationRule": {
                "cleftScoreCutoff": CLEFT_SCORE_CUTOFF,
                "siteWinnerOrder": list(NT_COLUMNS),
                "inhibitoryWinners": ["gaba", "glut"],
                "inhibitoryCondition": "strictly more than half of qualifying presynaptic sites",
                "unclassifiedValue": 0,
                "excitatoryValue": 1,
                "inhibitoryValue": -1,
            },
            "counts": counts,
            "provenance": provenance,
            "columns": {
                name: {"scalarType": scalar, "elementCount": int(root_ids.size), "path": path.name, "sha256": sha256_file(path)}
                for name, scalar, path in (("root_id", "u64", paths["root_id"]), ("total_presynaptic_sites", "u32", paths["total_presynaptic_sites"]), ("inhibitory_presynaptic_sites", "u32", paths["inhibitory_presynaptic_sites"]), ("neuron_sign", "i32", paths["neuron_sign"]))
            },
        }
        with (output_dir / "manifest.json").open("w", encoding="utf-8") as handle:
            json.dump(manifest, handle, indent=2, sort_keys=True)
            handle.write("\n")
        return manifest
    except Exception:
        shutil.rmtree(output_dir, ignore_errors=True)
        raise


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root-ids", type=Path, required=True)
    parser.add_argument("--site-level-synapses", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--accept-flywire-terms", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.accept_flywire_terms:
        raise SystemExit("Refusing conversion: supply --accept-flywire-terms after reviewing current FlyWire data-use conditions.")
    root_path, synapse_path, output_dir = args.root_ids.resolve(), args.site_level_synapses.resolve(), args.out_dir.resolve()
    if any(inside(path, PROJECT_ROOT) for path in (root_path, synapse_path, output_dir)):
        raise SystemExit("Inputs and output must remain outside the project repository.")
    if not root_path.is_file() or not synapse_path.is_file():
        raise SystemExit("Root IDs and official site-level Feather inputs must exist.")
    root_ids = np.load(root_path, allow_pickle=False)
    provenance = {
        "source": "https://zenodo.org/records/10676866",
        "license": "CC BY 4.0",
        "sourceFiles": [{"name": root_path.name, "sha256": sha256_file(root_path)}, {"name": synapse_path.name, "sha256": sha256_file(synapse_path)}],
        "transform": {"name": "digital-fly-build-v783-neuron-sign", "version": "1", "status": "SOURCE DATA DERIVATIVE; LIF KERNEL NOT YET EXECUTED"},
    }
    manifest = write_output(output_dir, root_ids.astype(np.uint64, copy=False), *aggregate(root_ids, iter_batches(synapse_path)), provenance)
    print(json.dumps({"manifest": str(output_dir / "manifest.json"), "counts": manifest["counts"]}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
