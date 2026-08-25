"""Create browser-safe GLB derivatives from user-supplied presentation meshes.

Inputs and outputs stay outside the WebDev source tree. The converter bakes scene
transforms, groups geometry by material, applies a bounded quadric decimation,
and exports a compact GLB along with a provenance report. It never modifies the
source GLB, connectome package, neural engine, or motor mapping.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import defaultdict
from pathlib import Path

import numpy as np
import trimesh


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def material_key(mesh: trimesh.Trimesh) -> tuple[str, tuple[int, ...]]:
    material = getattr(getattr(mesh, "visual", None), "material", None)
    name = str(getattr(material, "name", "default"))
    main_color = tuple(np.asarray(getattr(material, "main_color", [220, 220, 220, 255]), dtype=np.uint8).tolist())
    return name, main_color


def copy_visual(source: trimesh.Trimesh, target: trimesh.Trimesh) -> None:
    if getattr(source.visual, "kind", None) == "texture":
        target.visual = source.visual.copy()
    elif getattr(source.visual, "kind", None) == "face":
        target.visual.face_colors = source.visual.face_colors.copy()
    else:
        target.visual.vertex_colors = source.visual.vertex_colors.copy()


def simplify(mesh: trimesh.Trimesh, target_faces: int) -> trimesh.Trimesh:
    if len(mesh.faces) <= target_faces:
        return mesh.copy()
    candidate = mesh.simplify_quadric_decimation(face_count=max(32, target_faces))
    copy_visual(mesh, candidate)
    candidate.remove_unreferenced_vertices()
    return candidate


def load_instances(path: Path) -> list[trimesh.Trimesh]:
    scene = trimesh.load(path, force="scene", process=False)
    if not isinstance(scene, trimesh.Scene):
        return [scene]
    instances = scene.dump(concatenate=False)
    return [mesh for mesh in instances if isinstance(mesh, trimesh.Trimesh) and len(mesh.faces)]


def convert(source: Path, output: Path, target_faces: int, specimen: str) -> dict:
    instances = load_instances(source)
    grouped: dict[tuple[str, tuple[int, ...]], list[trimesh.Trimesh]] = defaultdict(list)
    for mesh in instances:
        grouped[material_key(mesh)].append(mesh)

    source_faces = sum(len(mesh.faces) for mesh in instances)
    source_vertices = sum(len(mesh.vertices) for mesh in instances)
    result = trimesh.Scene()
    report_meshes = []
    for index, ((name, color), meshes) in enumerate(grouped.items()):
        merged = trimesh.util.concatenate(meshes)
        allocated = max(96, round(target_faces * len(merged.faces) / max(1, source_faces)))
        optimized = simplify(merged, allocated)
        optimized.metadata["name"] = f"{specimen}-{index:02d}-{name}"
        result.add_geometry(optimized, node_name=f"{specimen}-presentation-{index:02d}", geom_name=optimized.metadata["name"])
        report_meshes.append({"material": name, "facesBefore": len(merged.faces), "facesAfter": len(optimized.faces), "verticesAfter": len(optimized.vertices), "color": color})

    minimum, maximum = result.bounds
    center = (minimum + maximum) * 0.5
    normalization = np.array([-center[0], -minimum[1], -center[2]])
    result.apply_transform(trimesh.transformations.translation_matrix(normalization))
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(result.export(file_type="glb"))
    return {
        "specimen": specimen,
        "source": str(source),
        "sourceSha256": sha256(source),
        "sourceBytes": source.stat().st_size,
        "sourceInstances": len(instances),
        "sourceFaces": source_faces,
        "sourceVertices": source_vertices,
        "targetFaces": target_faces,
        "output": str(output),
        "outputSha256": sha256(output),
        "outputBytes": output.stat().st_size,
        "outputFaces": sum(item["facesAfter"] for item in report_meshes),
        "normalizationTranslation": normalization.tolist(),
        "materialGroups": report_meshes,
        "presentationOnly": True,
        "provenance": "MODELLED MAPPING",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fly", type=Path, required=True)
    parser.add_argument("--worm", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--fly-faces", type=int, default=120_000)
    parser.add_argument("--worm-faces", type=int, default=95_000)
    args = parser.parse_args()

    report = {
        "fly": convert(args.fly, args.output_dir / "wildtype-female-drosophila-web.glb", args.fly_faces, "drosophila"),
        "worm": convert(args.worm, args.output_dir / "caenorhabditis-elegans-web.glb", args.worm_faces, "celegans"),
    }
    (args.output_dir / "report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
