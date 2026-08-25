"""Extract the recognisable C. elegans body from the user-supplied science-visualisation GLB.

The source GLB contains 470 small, repeated worm-body meshes plus one unrelated
3,024-face auxiliary object. This presentation-only extractor keeps the repeated
body meshes, joins them, applies a bounded decimation, and bakes a centered,
floor-aligned transform. It never changes connectome or simulation data.
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
    parser.add_argument("--faces", type=int, default=60_000)
    args = parser.parse_args()

    scene = trimesh.load(args.source, force="scene", process=False)
    if not isinstance(scene, trimesh.Scene):
        raise TypeError("Expected a GLB scene")
    instances = [mesh for mesh in scene.dump(concatenate=False) if isinstance(mesh, trimesh.Trimesh) and len(mesh.faces)]
    # `scene.dump()` reorders source nodes, so selection must use the material
    # family rather than mesh index. Material 1 is the source model's continuous
    # pink cuticle. The other material families add unrelated visualisation
    # structures that made the presentation look like a second organism.
    def is_body(mesh: trimesh.Trimesh) -> bool:
        material = getattr(mesh.visual, "material", None)
        return "wormtest1_objBaseMaterial1" in str(getattr(material, "name", ""))

    body = [mesh for mesh in instances if is_body(mesh)]
    excluded = [mesh for mesh in instances if not is_body(mesh)]
    if len(body) != 260 or len(excluded) != 211:
        raise ValueError(f"Unexpected source material layout: {len(body)} body and {len(excluded)} excluded")

    merged = trimesh.util.concatenate(body)
    original_faces = len(merged.faces)
    target_faces = min(args.faces, original_faces)
    if target_faces < original_faces:
        optimized = merged.simplify_quadric_decimation(face_count=target_faces)
    else:
        optimized = merged.copy()
    optimized.remove_unreferenced_vertices()

    minimum, maximum = optimized.bounds
    center = (minimum + maximum) * 0.5
    normalization = np.array([-center[0], -minimum[1], -center[2]])
    optimized.apply_transform(trimesh.transformations.translation_matrix(normalization))
    output_scene = trimesh.Scene(optimized)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(output_scene.export(file_type="glb"))

    report = {
        "source": str(args.source),
        "sourceSha256": sha256(args.source),
        "sourceInstances": len(instances),
        "bodyInstancesKept": len(body),
        "auxiliaryInstancesExcluded": len(excluded),
        "bodyFacesBefore": original_faces,
        "bodyFacesAfter": len(optimized.faces),
        "output": str(args.output),
        "outputBytes": args.output.stat().st_size,
        "outputSha256": sha256(args.output),
        "normalizationTranslation": normalization.tolist(),
        "presentationOnly": True,
        "provenance": "MODELLED MAPPING",
    }
    report_path = args.output.with_suffix(".report.json")
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
