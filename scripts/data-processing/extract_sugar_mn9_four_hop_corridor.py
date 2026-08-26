#!/usr/bin/env python3
"""Extract a bounded structural corridor from published sugar GRNs to MN9.

The corridor contains only paths of at most four directed connection rows in
the official v783 proofread CSR graph. It is structural source data, not a
causal sensory pathway or a whole-brain CPU fallback.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from collections import defaultdict, deque
from pathlib import Path
from typing import Any

import numpy as np


PROJECT_ROOT = Path(__file__).resolve().parents[2]


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


def load_column(pack_dir: Path, manifest: dict[str, Any], column: str, dtype: str) -> np.ndarray:
    chunks = {chunk["id"]: chunk for chunk in manifest["chunks"]}
    paths = [pack_dir / chunks[chunk_id]["path"] for chunk_id in manifest["columns"][column]["chunks"]]
    data = [np.fromfile(path, dtype=dtype) for path in paths]
    return np.concatenate(data) if len(data) > 1 else data[0]


def forward_edges(frontier: set[int], source: np.ndarray, offsets: np.ndarray, synapses: np.ndarray, minimum: int) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    if not frontier:
        empty = np.empty(0, dtype=np.uint32)
        return empty, empty, empty
    selected = np.flatnonzero(np.isin(source, np.fromiter(frontier, dtype=np.uint32)) & (synapses >= minimum))
    targets = np.searchsorted(offsets, selected, side="right").astype(np.uint32) - 1
    return source[selected], targets, synapses[selected]


def backward_edges(frontier: set[int], source: np.ndarray, offsets: np.ndarray, synapses: np.ndarray, minimum: int) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    selected_parts: list[np.ndarray] = []
    target_parts: list[np.ndarray] = []
    for target in sorted(frontier):
        edge_indices = np.arange(offsets[target], offsets[target + 1], dtype=np.uint32)
        keep = edge_indices[synapses[edge_indices] >= minimum]
        if keep.size:
            selected_parts.append(keep)
            target_parts.append(np.full(keep.size, target, dtype=np.uint32))
    if not selected_parts:
        empty = np.empty(0, dtype=np.uint32)
        return empty, empty, empty
    selected = np.concatenate(selected_parts)
    return source[selected], np.concatenate(target_parts), synapses[selected]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pack-dir", type=Path, required=True)
    parser.add_argument("--sugar-evidence", type=Path, required=True)
    parser.add_argument("--input-roots-json", type=Path, help="Optional JSON object with label and rootIds; otherwise uses present sugar roots from evidence.")
    parser.add_argument("--sign-dir", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--min-synapses", type=int, default=3)
    parser.add_argument("--max-nodes", type=int, default=5000)
    args = parser.parse_args()
    if args.min_synapses < 1:
        raise SystemExit("--min-synapses must be positive.")
    pack_dir, evidence_path, sign_dir, output_path = (args.pack_dir.resolve(), args.sugar_evidence.resolve(), args.sign_dir.resolve(), args.out.resolve())
    if inside(output_path, PROJECT_ROOT):
        raise SystemExit("Output must remain outside the repository.")
    manifest = json.loads((pack_dir / "manifest.json").read_text(encoding="utf-8"))
    evidence = json.loads(evidence_path.read_text(encoding="utf-8"))
    signs_manifest = json.loads((sign_dir / "manifest.json").read_text(encoding="utf-8"))
    if manifest.get("release") != "783" or signs_manifest.get("release") != "783":
        raise SystemExit("All input artifacts must be aligned to release 783.")
    roots = load_column(pack_dir, manifest, "root_id", "<u8")
    offsets = load_column(pack_dir, manifest, "incoming_offsets", "<u4")
    source = load_column(pack_dir, manifest, "source_index", "<u4")
    synapses = load_column(pack_dir, manifest, "synapse_count", "<u4")
    signs = np.fromfile(sign_dir / signs_manifest["columns"]["neuron_sign"]["path"], dtype="<i4")
    if not (roots.size == signs.size == manifest["neuronCount"] and offsets.size == roots.size + 1):
        raise SystemExit("CSR/sign artifact dimensions are inconsistent.")
    root_index = {str(root): index for index, root in enumerate(roots)}
    if args.input_roots_json:
        input_contract = json.loads(args.input_roots_json.read_text(encoding="utf-8"))
        input_label = str(input_contract["label"])
        input_roots = [str(root) for root in input_contract["rootIds"]]
    else:
        input_label = "Right labellar sugar-sensing GRNs"
        input_roots = [str(root) for root in evidence["sugarGrnPresentRootIds"]]
    observed_roots = [root for root in input_roots if root in root_index]
    missing_roots = [root for root in input_roots if root not in root_index]
    sugar = {root_index[root] for root in observed_roots}
    mn9_root = str(evidence["mn9RootId"])
    mn9 = root_index[mn9_root]
    f01 = forward_edges(sugar, source, offsets, synapses, args.min_synapses)
    f1 = set(map(int, f01[1]))
    f12 = forward_edges(f1, source, offsets, synapses, args.min_synapses)
    f2 = set(map(int, f12[1]))
    b10 = backward_edges({mn9}, source, offsets, synapses, args.min_synapses)
    b1 = set(map(int, b10[0]))
    b21 = backward_edges(b1, source, offsets, synapses, args.min_synapses)
    b2 = set(map(int, b21[0]))
    candidate_edges = [(int(s), int(t), int(w)) for s, t, w in zip(*f01, strict=True)] + [(int(s), int(t), int(w)) for s, t, w in zip(*f12, strict=True)] + [(int(s), int(t), int(w)) for s, t, w in zip(*b21, strict=True)] + [(int(s), int(t), int(w)) for s, t, w in zip(*b10, strict=True)]
    adjacency: dict[int, list[tuple[int, int]]] = defaultdict(list)
    reverse: dict[int, list[int]] = defaultdict(list)
    for source_index, target_index, count in candidate_edges:
        adjacency[source_index].append((target_index, count))
        reverse[target_index].append(source_index)
    distance_to_mn9 = {mn9: 0}
    queue: deque[int] = deque([mn9])
    while queue:
        target_index = queue.popleft()
        if distance_to_mn9[target_index] >= 4:
            continue
        for source_index in reverse[target_index]:
            if source_index not in distance_to_mn9:
                distance_to_mn9[source_index] = distance_to_mn9[target_index] + 1
                queue.append(source_index)
    distance_from_sugar: dict[int, int] = {index: 0 for index in sugar}
    queue = deque(sugar)
    while queue:
        source_index = queue.popleft()
        if distance_from_sugar[source_index] >= 4:
            continue
        for target_index, _ in adjacency.get(source_index, []):
            if target_index not in distance_from_sugar:
                distance_from_sugar[target_index] = distance_from_sugar[source_index] + 1
                queue.append(target_index)
    kept_nodes = {node for node, distance in distance_from_sugar.items() if node in distance_to_mn9 and distance + distance_to_mn9[node] <= 4}
    kept_edges = [(s, t, w) for s, t, w in candidate_edges if s in kept_nodes and t in kept_nodes and distance_from_sugar.get(s, 99) + 1 + distance_to_mn9.get(t, 99) <= 4]
    if len(kept_nodes) > args.max_nodes:
        raise SystemExit(f"Corridor has {len(kept_nodes)} nodes, exceeding --max-nodes={args.max_nodes}; raise the threshold or budget explicitly.")
    unclassified = [str(roots[node]) for node in kept_nodes if signs[node] == 0]
    result = {
        "status": "STRUCTURAL MULTI-HOP CORRIDOR — OFFLINE CANDIDATE ONLY",
        "sourceStatus": "SOURCE DATA",
        "release": "783",
        "mn9RootId": mn9_root,
        "inputPopulation": input_label,
        "inputRootIds": [str(roots[index]) for index in sorted(sugar)],
        "missingInputRootIds": missing_roots,
        "minimumSynapsesPerConnection": args.min_synapses,
        "maximumPathLength": 4,
        "nodeCount": len(kept_nodes),
        "edgeCount": len(kept_edges),
        "frontierCounts": {"sugar": len(sugar), "forward1": len(f1), "forward2": len(f2), "mn9Incoming": len(b1), "mn9TwoStepIncoming": len(b2)},
        "nodes": [{"rootId": str(roots[index]), "neuronSign": int(signs[index]), "signStatus": "SOURCE SITE-LEVEL" if signs[index] else "UNCLASSIFIED"} for index in sorted(kept_nodes)],
        "edges": [{"source": str(roots[s]), "target": str(roots[t]), "synapseCount": w, "edgeRole": "structural_corridor"} for s, t, w in kept_edges],
        "lifGate": {"state": "READY FOR SUBGRAPH" if kept_nodes and not unclassified else "BLOCKED", "reason": "All retained corridor nodes have classified site-level signs." if kept_nodes and not unclassified else "No retained path or one or more retained nodes lack a validated sign.", "missingOrUnclassifiedRootIds": unclassified},
        "provenance": {"packManifestSha256": sha256_file(pack_dir / "manifest.json"), "sugarEvidenceSha256": sha256_file(evidence_path), "signManifestSha256": sha256_file(sign_dir / "manifest.json")},
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({key: result[key] for key in ("nodeCount", "edgeCount", "frontierCounts", "lifGate")}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
