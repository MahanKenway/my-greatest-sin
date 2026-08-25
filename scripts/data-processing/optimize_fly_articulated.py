"""Create a compact, part-preserving Drosophila GLB for modelled articulation.

The source model has no skeleton or animations, but it contains 17 separate mesh
parts. This converter decimates each part independently, bakes source transforms,
and preserves a stable `fly-part-XX` mesh identity for presentation-only wing and
leg motion in Babylon. It never modifies the original source model or neural data.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
import trimesh


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--faces", type=int, default=135_000)
    args = parser.parse_args()
    source_scene = trimesh.load(args.source, force="scene", process=False)
    if not isinstance(source_scene, trimesh.Scene):
        raise TypeError("Expected a GLB scene")
    parts = [mesh for mesh in source_scene.dump(concatenate=False) if isinstance(mesh, trimesh.Trimesh) and len(mesh.faces)]
    if len(parts) != 17:
        raise ValueError(f"Expected 17 source mesh parts; found {len(parts)}")
    source_faces = sum(len(mesh.faces) for mesh in parts)
    result = trimesh.Scene()
    report_parts = []
    for index, part in enumerate(parts):
        target_faces = max(300, round(args.faces * len(part.faces) / source_faces))
        optimized = part.simplify_quadric_decimation(face_count=min(len(part.faces), target_faces)) if len(part.faces) > target_faces else part.copy()
        optimized.remove_unreferenced_vertices()
        name = f"fly-part-{index:02d}"
        optimized.metadata["name"] = name
        result.add_geometry(optimized, node_name=name, geom_name=name)
        report_parts.append({"index": index, "name": name, "facesBefore": len(part.faces), "facesAfter": len(optimized.faces)})
    minimum, maximum = result.bounds
    center = (minimum + maximum) * 0.5
    normalization = np.array([-center[0], -minimum[1], -center[2]])
    result.apply_transform(trimesh.transformations.translation_matrix(normalization))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(result.export(file_type="glb"))
    report = {
        "source": str(args.source),
        "sourceSha256": sha256(args.source),
        "partCount": len(parts),
        "sourceFaces": source_faces,
        "outputFaces": sum(item["facesAfter"] for item in report_parts),
        "outputBytes": args.output.stat().st_size,
        "outputSha256": sha256(args.output),
        "normalizationTranslation": normalization.tolist(),
        "parts": report_parts,
        "presentationOnly": True,
        "provenance": "MODELLED MAPPING",
    }
    args.output.with_suffix(".report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
