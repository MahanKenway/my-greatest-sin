#!/usr/bin/env python3
"""Build a checksummed DFLY v1 pack from user-obtained FlyWire v783 proofread data.

The converter never downloads FlyWire data, never uploads it, and refuses project-tree output by
default. It derives only a compact graph representation from `proofread_root_ids_783.npy` and
`proofread_connections_783.feather`; all source terms and citations are recorded in manifest.json.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

import numpy as np
import pyarrow as pa
import pyarrow.ipc as ipc


TRANSFORM_NAME = "digital-fly-build-v783-pack"
TRANSFORM_VERSION = "1"
NT_COLUMNS = ("gaba_avg", "ach_avg", "glut_avg", "oct_avg", "ser_avg", "da_avg")
REQUIRED_COLUMNS = ("pre_pt_root_id", "post_pt_root_id", "neuropil", "syn_count")
PROJECT_ROOT = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class InputProvenance:
    source_url: str
    license_name: str
    citations: tuple[str, ...]


@dataclass(frozen=True)
class ColumnDefinition:
    name: str
    scalar_type: str
    element_count: int
    semantic_status: str
    stride: int = 1


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(8 * 1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def is_within(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def open_feather_batches(path: Path) -> Iterable[pa.RecordBatch]:
    """Iterate IPC/Feather v2 record batches without materializing a full table."""
    source = pa.memory_map(str(path), "r")
    reader = ipc.open_file(source)
    for index in range(reader.num_record_batches):
        yield reader.get_batch(index)


def batch_columns(batch: pa.RecordBatch) -> dict[str, int]:
    return {name: index for index, name in enumerate(batch.schema.names)}


def validate_connection_schema(path: Path) -> tuple[set[str], int]:
    source = pa.memory_map(str(path), "r")
    reader = ipc.open_file(source)
    names = set(reader.schema.names)
    missing = sorted(set(REQUIRED_COLUMNS) - names)
    if missing:
        raise ValueError(f"Connections Feather is missing required columns: {', '.join(missing)}")
    return names, reader.num_record_batches


def load_root_ids(path: Path) -> np.ndarray:
    root_ids = np.load(path, allow_pickle=False)
    if root_ids.ndim != 1 or root_ids.size == 0:
        raise ValueError("Root ID input must be a non-empty one-dimensional .npy array.")
    if not np.issubdtype(root_ids.dtype, np.integer):
        raise ValueError("Root ID input must contain integer values.")
    root_ids = root_ids.astype(np.uint64, copy=False)
    if np.unique(root_ids).size != root_ids.size:
        raise ValueError("Root ID input contains duplicates and cannot define a stable compact index.")
    return root_ids


def decode_batch(batch: pa.RecordBatch, has_nt: bool) -> tuple[np.ndarray, np.ndarray, list[str], np.ndarray, np.ndarray | None]:
    indices = batch_columns(batch)
    pre_ids = batch.column(indices["pre_pt_root_id"]).to_numpy(zero_copy_only=False).astype(np.uint64, copy=False)
    post_ids = batch.column(indices["post_pt_root_id"]).to_numpy(zero_copy_only=False).astype(np.uint64, copy=False)
    neuropils = ["" if value is None else str(value) for value in batch.column(indices["neuropil"]).to_pylist()]
    counts = batch.column(indices["syn_count"]).to_numpy(zero_copy_only=False).astype(np.uint32, copy=False)
    probabilities = None
    if has_nt:
        probabilities = np.stack(
            [batch.column(indices[column]).to_numpy(zero_copy_only=False).astype(np.float16, copy=False) for column in NT_COLUMNS],
            axis=1,
        )
    return pre_ids, post_ids, neuropils, counts, probabilities


def prepare_output_dir(path: Path) -> None:
    if path.exists() and any(path.iterdir()):
        raise ValueError(f"Output directory must be empty: {path}")
    path.mkdir(parents=True, exist_ok=True)


def make_column_files(work_dir: Path, edge_count: int, include_nt: bool) -> dict[str, np.memmap | np.ndarray]:
    columns: dict[str, np.memmap | np.ndarray] = {
        "source_index": np.memmap(work_dir / "source-index.u32.bin", mode="w+", dtype="<u4", shape=(edge_count,)),
        "synapse_count": np.memmap(work_dir / "synapse-count.u32.bin", mode="w+", dtype="<u4", shape=(edge_count,)),
        "neuropil_index": np.memmap(work_dir / "neuropil-index.u16.bin", mode="w+", dtype="<u2", shape=(edge_count,)),
    }
    if include_nt:
        columns["nt_probabilities"] = np.memmap(
            work_dir / "nt-probabilities.f16x6.bin", mode="w+", dtype="<f2", shape=(edge_count, 6)
        )
    return columns


def flush_memmaps(columns: dict[str, np.memmap | np.ndarray]) -> None:
    for column in columns.values():
        if isinstance(column, np.memmap):
            column.flush()


def chunk_column(source: Path, output_dir: Path, column: ColumnDefinition, chunk_bytes: int) -> list[dict[str, Any]]:
    chunks_dir = output_dir / "chunks"
    chunks_dir.mkdir(exist_ok=True)
    chunks: list[dict[str, Any]] = []
    item_bytes = np.dtype({"u16": "<u2", "u32": "<u4", "u64": "<u8", "f16": "<f2"}[column.scalar_type]).itemsize * column.stride
    item_offset = 0
    with source.open("rb") as input_handle:
        part = 0
        while True:
            block = input_handle.read(chunk_bytes)
            if not block:
                break
            if len(block) % item_bytes:
                raise ValueError(f"Column {column.name} is not aligned to its declared element stride.")
            filename = f"{column.name}-{part:05d}.bin"
            target = chunks_dir / filename
            with target.open("wb") as output_handle:
                output_handle.write(block)
            item_count = len(block) // item_bytes
            chunks.append(
                {
                    "id": f"{column.name}:{part}",
                    "column": column.name,
                    "path": f"chunks/{filename}",
                    "bytes": len(block),
                    "sha256": sha256_file(target),
                    "elementOffset": item_offset,
                    "elementCount": item_count,
                }
            )
            item_offset += item_count
            part += 1
    if item_offset != column.element_count:
        raise ValueError(f"Column {column.name} wrote {item_offset} values; expected {column.element_count}.")
    return chunks


def build_pack(
    root_ids_path: Path,
    connections_path: Path,
    output_dir: Path,
    provenance: InputProvenance,
    chunk_mib: int = 64,
) -> dict[str, Any]:
    root_ids = load_root_ids(root_ids_path)
    schema_names, batch_count = validate_connection_schema(connections_path)
    has_nt = set(NT_COLUMNS).issubset(schema_names)
    root_to_index = {int(root_id): index for index, root_id in enumerate(root_ids)}
    incoming_counts = np.zeros(root_ids.size, dtype=np.uint64)
    neuropil_to_index: dict[str, int] = {}
    accepted_edges = 0

    for batch in open_feather_batches(connections_path):
        pre_ids, post_ids, neuropils, counts, _ = decode_batch(batch, has_nt)
        for pre_id, post_id, neuropil, syn_count in zip(pre_ids, post_ids, neuropils, counts, strict=True):
            if int(syn_count) == 0:
                continue
            if int(pre_id) not in root_to_index or int(post_id) not in root_to_index:
                continue
            target_index = root_to_index[int(post_id)]
            incoming_counts[target_index] += 1
            neuropil_to_index.setdefault(neuropil, len(neuropil_to_index))
            accepted_edges += 1

    if accepted_edges == 0:
        raise ValueError("No valid proofread connections matched the supplied proofread root IDs.")
    if accepted_edges >= 2**32:
        raise ValueError("DFLY v1 uses Uint32 edge offsets and cannot encode this many edges.")

    incoming_offsets = np.zeros(root_ids.size + 1, dtype=np.uint32)
    np.cumsum(incoming_counts, dtype=np.uint64, out=incoming_offsets[1:])
    if int(incoming_offsets[-1]) != accepted_edges:
        raise ValueError("CSR offsets are inconsistent with accepted edge count.")

    prepare_output_dir(output_dir)
    with tempfile.TemporaryDirectory(prefix="dfly-v783-") as temp_dir_string:
        temp_dir = Path(temp_dir_string)
        root_file = temp_dir / "root-id.u64.bin"
        offsets_file = temp_dir / "incoming-offsets.u32.bin"
        root_ids.astype("<u8", copy=False).tofile(root_file)
        incoming_offsets.astype("<u4", copy=False).tofile(offsets_file)
        edge_columns = make_column_files(temp_dir, accepted_edges, has_nt)
        cursors = incoming_offsets[:-1].copy()

        for batch in open_feather_batches(connections_path):
            pre_ids, post_ids, neuropils, counts, probabilities = decode_batch(batch, has_nt)
            for row, (pre_id, post_id, neuropil, syn_count) in enumerate(zip(pre_ids, post_ids, neuropils, counts, strict=True)):
                if int(syn_count) == 0:
                    continue
                source_index = root_to_index.get(int(pre_id))
                target_index = root_to_index.get(int(post_id))
                if source_index is None or target_index is None:
                    continue
                slot = int(cursors[target_index])
                edge_columns["source_index"][slot] = source_index
                edge_columns["synapse_count"][slot] = syn_count
                edge_columns["neuropil_index"][slot] = neuropil_to_index[neuropil]
                if probabilities is not None:
                    edge_columns["nt_probabilities"][slot] = probabilities[row]
                cursors[target_index] += 1
        if not np.array_equal(cursors, incoming_offsets[1:]):
            raise ValueError("Second pass did not fill all CSR target ranges.")
        flush_memmaps(edge_columns)

        definitions = [
            ColumnDefinition("root_id", "u64", int(root_ids.size), "SOURCE DATA"),
            ColumnDefinition("incoming_offsets", "u32", int(root_ids.size + 1), "SOURCE DATA"),
            ColumnDefinition("source_index", "u32", accepted_edges, "SOURCE DATA"),
            ColumnDefinition("synapse_count", "u32", accepted_edges, "SOURCE DATA"),
            ColumnDefinition("neuropil_index", "u16", accepted_edges, "SOURCE DATA"),
        ]
        paths: dict[str, Path] = {
            "root_id": root_file,
            "incoming_offsets": offsets_file,
            "source_index": temp_dir / "source-index.u32.bin",
            "synapse_count": temp_dir / "synapse-count.u32.bin",
            "neuropil_index": temp_dir / "neuropil-index.u16.bin",
        }
        if has_nt:
            definitions.append(ColumnDefinition("nt_probabilities", "f16", accepted_edges, "SOURCE DATA", stride=6))
            paths["nt_probabilities"] = temp_dir / "nt-probabilities.f16x6.bin"

        all_chunks: list[dict[str, Any]] = []
        columns_manifest: dict[str, Any] = {}
        chunk_bytes = chunk_mib * 1024 * 1024
        for definition in definitions:
            chunks = chunk_column(paths[definition.name], output_dir, definition, chunk_bytes)
            all_chunks.extend(chunks)
            columns_manifest[definition.name] = {
                "scalarType": definition.scalar_type,
                "elementCount": definition.element_count,
                "stride": definition.stride,
                "semanticStatus": definition.semantic_status,
                "chunks": [chunk["id"] for chunk in chunks],
            }

    manifest = {
        "format": "DFLY",
        "formatVersion": 1,
        "datasetId": "flywire-v783-proofread-connections",
        "release": "783",
        "origin": provenance.source_url,
        "license": provenance.license_name,
        "neuronCount": int(root_ids.size),
        "synapseCount": accepted_edges,
        "provenance": {
            "sourceFiles": [
                {"name": root_ids_path.name, "sha256": sha256_file(root_ids_path)},
                {"name": connections_path.name, "sha256": sha256_file(connections_path)},
            ],
            "citations": list(provenance.citations),
            "transform": {
                "name": TRANSFORM_NAME,
                "version": TRANSFORM_VERSION,
                "featherRecordBatches": batch_count,
                "neurotransmitterColumnOrder": list(NT_COLUMNS) if has_nt else [],
            },
        },
        "dictionaries": {"neuropils": [name for name, _ in sorted(neuropil_to_index.items(), key=lambda item: item[1])]},
        "columns": columns_manifest,
        "chunks": all_chunks,
    }
    with (output_dir / "manifest.json").open("w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2, sort_keys=True)
        handle.write("\n")
    return manifest


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root-ids", type=Path, required=True, help="User-obtained proofread_root_ids_783.npy")
    parser.add_argument("--connections", type=Path, required=True, help="User-obtained proofread_connections_783.feather")
    parser.add_argument("--out-dir", type=Path, required=True, help="Empty directory outside this Git repository")
    parser.add_argument("--source-url", default="https://zenodo.org/records/10676866")
    parser.add_argument("--license", dest="license_name", default="CC BY-NC 4.0")
    parser.add_argument("--citation", action="append", default=[], help="Repeat for every required source citation")
    parser.add_argument("--chunk-mib", type=int, default=64, help="Maximum binary chunk size in MiB")
    parser.add_argument("--accept-flywire-terms", action="store_true", help="Required acknowledgement before converting user-obtained FlyWire data")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.accept_flywire_terms:
        raise SystemExit("Refusing conversion: supply --accept-flywire-terms after reviewing current FlyWire data-use conditions.")
    if args.chunk_mib < 1 or args.chunk_mib > 1024:
        raise SystemExit("--chunk-mib must be between 1 and 1024.")
    root_ids_path = args.root_ids.resolve()
    connections_path = args.connections.resolve()
    output_dir = args.out_dir.resolve()
    if is_within(output_dir, PROJECT_ROOT):
        raise SystemExit("Refusing output inside the repository. Choose external storage such as /home/ubuntu/flywire-packs/v783.")
    if not root_ids_path.is_file() or not connections_path.is_file():
        raise SystemExit("Both --root-ids and --connections must point to readable local files.")
    citations = tuple(args.citation) or (
        "Dorkenwald et al. (2024), Neuronal wiring diagram of an adult brain, Nature.",
        "FlyWire Whole-brain Connectome Connectivity Data, release 783, Zenodo.",
    )
    try:
        manifest = build_pack(
            root_ids_path,
            connections_path,
            output_dir,
            InputProvenance(args.source_url, args.license_name, citations),
            args.chunk_mib,
        )
    except (OSError, ValueError, pa.ArrowException) as error:
        shutil.rmtree(output_dir, ignore_errors=True)
        raise SystemExit(f"DFLY conversion failed: {error}") from error
    print(json.dumps({"manifest": str(output_dir / "manifest.json"), "neurons": manifest["neuronCount"], "edges": manifest["synapseCount"], "chunks": len(manifest["chunks"])}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
