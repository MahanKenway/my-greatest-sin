#!/usr/bin/env python3
"""Join the published sugar→MN9 structural paths to v783 site-level neuron signs.

This derives an OFFLINE SUBGRAPH VALIDATION artifact only. It never changes the
browser's GameWorld, FlyBody, WebGPU benchmark, or full FlyWire execution state.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

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


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--two-hop-evidence", type=Path, required=True)
    parser.add_argument("--sign-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    evidence_path, sign_dir, output_path = args.two_hop_evidence.resolve(), args.sign_dir.resolve(), args.output.resolve()
    if inside(output_path, PROJECT_ROOT):
        raise SystemExit("Output must remain outside the project repository.")
    evidence = json.loads(evidence_path.read_text(encoding="utf-8"))
    manifest = json.loads((sign_dir / "manifest.json").read_text(encoding="utf-8"))
    if manifest.get("format") != "DFLY-NEURON-SIGN" or manifest.get("release") != "783":
        raise SystemExit("Sign input must be a release-783 DFLY-NEURON-SIGN artifact.")
    roots = np.fromfile(sign_dir / manifest["columns"]["root_id"]["path"], dtype="<u8")
    signs = np.fromfile(sign_dir / manifest["columns"]["neuron_sign"]["path"], dtype="<i4")
    if roots.size != signs.size or roots.size != manifest["neuronCount"]:
        raise SystemExit("Sign artifact arrays do not match manifest neuronCount.")
    sign_by_root = {str(root): int(sign) for root, sign in zip(roots, signs, strict=True)}
    mn9 = str(evidence["mn9RootId"])
    edges: list[dict[str, object]] = []
    node_ids = {mn9}
    for path in evidence["twoHopPaths"]:
        intermediate = str(path["intermediateRootId"])
        node_ids.add(intermediate)
        edges.append({"source": intermediate, "target": mn9, "synapseCount": int(path["intermediateToMn9"]), "edgeRole": "intermediate_to_mn9"})
        for sugar_root, synapse_count in path["sugarToIntermediate"].items():
            root = str(sugar_root)
            node_ids.add(root)
            edges.append({"source": root, "target": intermediate, "synapseCount": int(synapse_count), "edgeRole": "sugar_to_intermediate"})
    nodes = [{"rootId": root, "neuronSign": sign_by_root.get(root, 0), "signStatus": "SOURCE SITE-LEVEL" if root in sign_by_root else "MISSING"} for root in sorted(node_ids)]
    missing_or_unclassified = [node["rootId"] for node in nodes if node["neuronSign"] == 0]
    for edge in edges:
        edge["sourceNeuronSign"] = sign_by_root.get(str(edge["source"]), 0)
    output = {
        "status": "OFFLINE SUBGRAPH VALIDATION — NOT FULL FLYWIRE EXECUTION",
        "sourceStatus": "SOURCE DATA",
        "dataset": evidence["dataset"],
        "release": "783",
        "mn9RootId": mn9,
        "nodeCount": len(nodes),
        "edgeCount": len(edges),
        "nodes": nodes,
        "edges": edges,
        "lifGate": {
            "state": "READY FOR SUBGRAPH" if not missing_or_unclassified else "BLOCKED",
            "reason": "All subgraph source nodes carry classified v783 site-level signs." if not missing_or_unclassified else "One or more subgraph source nodes lack a validated neuron sign.",
            "missingOrUnclassifiedRootIds": missing_or_unclassified,
        },
        "provenance": {
            "twoHopEvidenceSha256": sha256_file(evidence_path),
            "signManifestSha256": sha256_file(sign_dir / "manifest.json"),
            "signRule": manifest["classificationRule"],
        },
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(output_path), "nodeCount": output["nodeCount"], "edgeCount": output["edgeCount"], "lifGate": output["lifGate"]}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
