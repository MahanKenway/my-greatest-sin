#!/usr/bin/env python3
"""Build a checksum-bearing, bounded CPU-only corridor pack outside the repo.

This is deliberately not a converter for full FlyWire. It accepts only a signed,
previously extracted corridor and enforces a small hard cap suitable for a browser
worker. Root IDs are handled as strings and are not emitted for internal nodes.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

MAX_NODES = 2_000
MAX_EDGES = 25_000


def sha256_path(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--corridor", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    source_sha = sha256_path(args.corridor)
    corridor = json.loads(args.corridor.read_text(encoding="utf-8"))
    nodes = corridor["nodes"]
    edges = corridor["edges"]
    if len(nodes) > MAX_NODES or len(edges) > MAX_EDGES:
        raise SystemExit(f"Refusing CPU pack with {len(nodes)} nodes / {len(edges)} edges; caps are {MAX_NODES} / {MAX_EDGES}.")

    root_index = {node["rootId"]: index for index, node in enumerate(nodes)}
    input_indices = [root_index[root] for root in corridor["inputRootIds"] if root in root_index]
    mn9_index = root_index.get(corridor["mn9RootId"])
    if not input_indices or mn9_index is None:
        raise SystemExit("Corridor lacks retained input roots or MN9; cannot form bounded CPU pack.")

    source_indices: list[int] = []
    target_indices: list[int] = []
    signed_synapse_counts: list[int] = []
    for edge in edges:
        source = root_index.get(edge["source"])
        target = root_index.get(edge["target"])
        if source is None or target is None:
            raise SystemExit("Corridor edge refers to a node outside the signed node list.")
        sign = int(nodes[source]["neuronSign"])
        if sign not in (-1, 1):
            raise SystemExit("Corridor includes a node without a source-derived ±1 sign.")
        source_indices.append(source)
        target_indices.append(target)
        signed_synapse_counts.append(sign * int(edge["synapseCount"]))

    pack = {
        "schema": "my-greatest-sin.cpu-corridor.v1",
        "status": "CPU OFFLINE SUBGRAPH VALIDATION ONLY",
        "sourceStatus": "SOURCE DATA",
        "modelledInput": "MODELLED SENSOR INPUT",
        "modelledDynamics": "SIGNED STRUCTURAL PROPAGATION — NOT LIF",
        "limits": {"maxNodes": MAX_NODES, "maxEdges": MAX_EDGES},
        "nodeCount": len(nodes),
        "edgeCount": len(edges),
        "inputIndices": input_indices,
        "mn9Index": mn9_index,
        "mn9RootId": corridor["mn9RootId"],
        "sourceIndices": source_indices,
        "targetIndices": target_indices,
        "signedSynapseCounts": signed_synapse_counts,
        "provenance": {**corridor["provenance"], "corridorSha256": source_sha, "release": corridor["release"]},
        "boundary": "Bounded CPU structural propagation may not activate GameWorld, FlyBody, a full FlyWire pack, or a biological motor decoder.",
    }
    serialized = json.dumps(pack, separators=(",", ":"), sort_keys=True).encode("utf-8")
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_bytes(serialized)
    print(json.dumps({"output": str(args.out), "bytes": len(serialized), "sha256": hashlib.sha256(serialized).hexdigest(), "nodeCount": len(nodes), "edgeCount": len(edges)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
