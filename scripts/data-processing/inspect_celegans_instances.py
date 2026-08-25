"""Report transformed C. elegans GLB instances to support presentation-only extraction."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import trimesh


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    args = parser.parse_args()
    scene = trimesh.load(args.source, force="scene", process=False)
    if not isinstance(scene, trimesh.Scene):
        raise TypeError("Expected a GLB scene")
    report = []
    for index, mesh in enumerate(scene.dump(concatenate=False)):
        if not isinstance(mesh, trimesh.Trimesh) or not len(mesh.faces):
            continue
        material = getattr(mesh.visual, "material", None)
        report.append({
            "index": index,
            "faces": len(mesh.faces),
            "vertices": len(mesh.vertices),
            "center": np.round(mesh.bounds.mean(axis=0), 4).tolist(),
            "extent": np.round(mesh.extents, 4).tolist(),
            "visual": getattr(mesh.visual, "kind", "none"),
            "materialName": str(getattr(material, "name", "")),
            "materialType": type(material).__name__,
        })
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
