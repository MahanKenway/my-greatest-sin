"""Report world-space bounds of presentation GLBs without modifying them."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import trimesh


def report(path: Path) -> dict:
    scene = trimesh.load(path, force="scene", process=False)
    meshes = [mesh for mesh in scene.dump(concatenate=False) if isinstance(mesh, trimesh.Trimesh) and len(mesh.faces)]
    merged = trimesh.util.concatenate(meshes)
    minimum, maximum = merged.bounds
    return {
        "file": path.name,
        "meshCount": len(meshes),
        "minimum": minimum.tolist(),
        "maximum": maximum.tolist(),
        "extent": (maximum - minimum).tolist(),
        "center": ((maximum + minimum) * 0.5).tolist(),
        "faces": len(merged.faces),
    }


print(json.dumps([report(Path(argument)) for argument in sys.argv[1:]], indent=2))
