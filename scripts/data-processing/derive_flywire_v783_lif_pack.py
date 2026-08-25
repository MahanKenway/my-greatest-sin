#!/usr/bin/env python3
"""Derive a checksum-verified, transmitter-aware FlyWire v783 LIF candidate pack.

This only copies validated DFLY chunks already built from official user-obtained
v783 source files. It never downloads/uploads FlyWire data and refuses project
tree output. The derived pack is a LIF *input candidate*, not an active model.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[2]
REQUIRED_COLUMNS = ("root_id", "incoming_offsets", "source_index", "synapse_count", "nt_probabilities")
EXPECTED_NT_ORDER = ["gaba_avg", "ach_avg", "glut_avg", "oct_avg", "ser_avg", "da_avg"]


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


def load_manifest(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        manifest = json.load(handle)
    if manifest.get("format") != "DFLY" or manifest.get("release") != "783":
        raise ValueError("Source must be a DFLY release 783 manifest.")
    columns = manifest.get("columns", {})
    missing = [column for column in REQUIRED_COLUMNS if column not in columns]
    if missing:
        raise ValueError(f"Source manifest is missing LIF columns: {', '.join(missing)}")
    nt = columns["nt_probabilities"]
    if nt.get("scalarType") != "f16" or nt.get("stride") != 6:
        raise ValueError("nt_probabilities must be f16 with stride 6.")
    actual_order = manifest.get("provenance", {}).get("transform", {}).get("neurotransmitterColumnOrder")
    if actual_order != EXPECTED_NT_ORDER:
        raise ValueError("Source transmitter order is missing or does not match the accepted v783 contract.")
    return manifest


def derive(source_dir: Path, output_dir: Path) -> dict[str, Any]:
    manifest_path = source_dir / "manifest.json"
    manifest = load_manifest(manifest_path)
    if output_dir.exists() and any(output_dir.iterdir()):
        raise ValueError(f"Output directory must be empty: {output_dir}")
    output_dir.mkdir(parents=True, exist_ok=True)
    chunks_dir = output_dir / "chunks"
    chunks_dir.mkdir(exist_ok=True)
    source_chunks = {chunk["id"]: chunk for chunk in manifest["chunks"]}
    selected_ids = [chunk_id for column in REQUIRED_COLUMNS for chunk_id in manifest["columns"][column]["chunks"]]
    selected_chunks: list[dict[str, Any]] = []
    try:
        for chunk_id in selected_ids:
            chunk = source_chunks.get(chunk_id)
            if chunk is None:
                raise ValueError(f"Manifest references missing chunk {chunk_id}.")
            source_file = source_dir / chunk["path"]
            if not source_file.is_file() or source_file.stat().st_size != chunk["bytes"]:
                raise ValueError(f"Source chunk failed size validation: {chunk_id}.")
            if sha256_file(source_file) != chunk["sha256"]:
                raise ValueError(f"Source chunk failed SHA-256 validation: {chunk_id}.")
            target_file = chunks_dir / Path(chunk["path"]).name
            shutil.copyfile(source_file, target_file)
            if sha256_file(target_file) != chunk["sha256"]:
                raise ValueError(f"Copied chunk failed SHA-256 validation: {chunk_id}.")
            selected_chunks.append({**chunk, "path": f"chunks/{target_file.name}"})
        source_manifest_sha256 = sha256_file(manifest_path)
        derived = {
            **{key: manifest[key] for key in ("format", "formatVersion", "release", "origin", "license", "neuronCount", "synapseCount")},
            "datasetId": "flywire-v783-proofread-connections-lif-candidate",
            "columns": {column: manifest["columns"][column] for column in REQUIRED_COLUMNS},
            "chunks": selected_chunks,
            "provenance": {
                **manifest.get("provenance", {}),
                "transform": {
                    **manifest.get("provenance", {}).get("transform", {}),
                    "name": "digital-fly-derive-v783-lif-candidate",
                    "version": "1",
                    "baseManifestSha256": source_manifest_sha256,
                    "selectedColumns": list(REQUIRED_COLUMNS),
                    "status": "SOURCE DATA COLUMNS; LIF EXECUTION NOT YET VALIDATED",
                },
            },
        }
        with (output_dir / "manifest.json").open("w", encoding="utf-8") as handle:
            json.dump(derived, handle, indent=2, sort_keys=True)
            handle.write("\n")
        report = {
            "manifest": str(output_dir / "manifest.json"),
            "manifestSha256": sha256_file(output_dir / "manifest.json"),
            "selectedColumns": list(REQUIRED_COLUMNS),
            "selectedChunkCount": len(selected_chunks),
            "selectedBytes": sum(chunk["bytes"] for chunk in selected_chunks),
            "neuronCount": derived["neuronCount"],
            "synapseCount": derived["synapseCount"],
            "neurotransmitterColumnOrder": EXPECTED_NT_ORDER,
        }
        with (output_dir / "derivation-report.json").open("w", encoding="utf-8") as handle:
            json.dump(report, handle, indent=2, sort_keys=True)
            handle.write("\n")
        return report
    except Exception:
        shutil.rmtree(output_dir, ignore_errors=True)
        raise


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path, required=True, help="Verified complete v783 DFLY pack directory")
    parser.add_argument("--out-dir", type=Path, required=True, help="Empty output directory outside the repository")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source_dir = args.source_dir.resolve()
    output_dir = args.out_dir.resolve()
    if inside(source_dir, PROJECT_ROOT) or inside(output_dir, PROJECT_ROOT):
        raise SystemExit("Source and output must remain outside the project repository.")
    if not source_dir.is_dir():
        raise SystemExit("--source-dir must be an existing verified DFLY pack directory.")
    try:
        print(json.dumps(derive(source_dir, output_dir), indent=2))
    except (OSError, ValueError, KeyError, TypeError) as error:
        raise SystemExit(f"LIF candidate derivation failed: {error}") from error
    return 0


if __name__ == "__main__":
    sys.exit(main())
