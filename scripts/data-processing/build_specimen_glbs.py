#!/usr/bin/env python3
"""Build lightweight presentation-only specimen GLBs outside the repository asset tree.

The fly uses Apache-2.0 NeuroMechFly STL components and the supplied SDF resting pose.
The worm is a compact original presentation mesh informed by OpenWorm WormBrowser's MIT visual reference.
Neither output represents neural source data or changes the simulation's modelled motor mapping.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from xml.etree import ElementTree

import numpy as np
import trimesh


BODY_COLOR = np.array([208, 194, 166, 255], dtype=np.uint8)
LEG_COLOR = np.array([112, 105, 94, 255], dtype=np.uint8)
EYE_COLOR = np.array([114, 31, 36, 255], dtype=np.uint8)
WING_COLOR = np.array([207, 232, 231, 190], dtype=np.uint8)
ANTENNA_COLOR = np.array([83, 76, 68, 255], dtype=np.uint8)


def parse_pose(text: str | None) -> np.ndarray:
    values = [float(value) for value in (text or "0 0 0 0 0 0").split()]
    if len(values) != 6:
        raise ValueError(f"Expected six pose values, got {values!r}")
    return np.array(values, dtype=np.float64)


def part_color(name: str) -> np.ndarray:
    lowered = name.lower()
    if "eye" in lowered:
        return EYE_COLOR
    if "wing" in lowered:
        return WING_COLOR
    if "antenna" in lowered:
        return ANTENNA_COLOR
    if any(token in lowered for token in ("coxa", "femur", "tibia", "tarsus", "claw", "haltere")):
        return LEG_COLOR
    return BODY_COLOR


def simplify(mesh: trimesh.Trimesh, maximum_faces: int) -> trimesh.Trimesh:
    if len(mesh.faces) <= maximum_faces:
        return mesh
    return mesh.simplify_quadric_decimation(face_count=maximum_faces)


def load_fly_meshes(sdf_path: Path, maximum_faces_per_part: int) -> list[trimesh.Trimesh]:
    root = ElementTree.parse(sdf_path).getroot()
    meshes: list[trimesh.Trimesh] = []
    for link in root.findall(".//link"):
        visual = link.find("visual")
        uri = visual.findtext("geometry/mesh/uri") if visual is not None else None
        if not uri:
            continue
        mesh_path = (sdf_path.parent / uri).resolve()
        if not mesh_path.exists():
            continue
        loaded = trimesh.load(mesh_path, force="mesh", process=False)
        if isinstance(loaded, trimesh.Scene):
            loaded = trimesh.util.concatenate(tuple(loaded.geometry.values()))
        if not isinstance(loaded, trimesh.Trimesh) or loaded.is_empty:
            continue
        mesh = simplify(loaded.copy(), maximum_faces_per_part)
        scale_text = visual.findtext("geometry/mesh/scale") if visual is not None else None
        scale = np.array([float(value) for value in (scale_text or "1 1 1").split()], dtype=np.float64)
        if scale.shape != (3,):
            raise ValueError(f"Unexpected mesh scale {scale_text!r} for {mesh_path}")
        mesh.apply_scale(scale)
        link_pose = parse_pose(link.findtext("pose"))
        visual_pose = parse_pose(visual.findtext("pose") if visual is not None else None)
        mesh.apply_translation(link_pose[:3] + visual_pose[:3])
        mesh.visual.vertex_colors = np.tile(part_color(link.attrib.get("name", "")), (len(mesh.vertices), 1))
        meshes.append(mesh)
    if not meshes:
        raise RuntimeError("No fly visual meshes were loaded from the SDF.")
    return meshes


def center_scale(mesh: trimesh.Trimesh, target_length: float) -> trimesh.Trimesh:
    bounds = mesh.bounds
    mesh.apply_translation(-mesh.centroid)
    span = float(np.max(bounds[1] - bounds[0]))
    if span <= 0:
        raise RuntimeError("Mesh has zero spatial extent.")
    mesh.apply_scale(target_length / span)
    return mesh


def build_worm_mesh(rings: int = 36, sides: int = 14) -> trimesh.Trimesh:
    vertices: list[list[float]] = []
    colors: list[list[int]] = []
    faces: list[list[int]] = []
    for ring in range(rings):
        progress = ring / (rings - 1)
        x = (progress - 0.5) * 3.1
        radius = 0.035 + 0.245 * math.sin(math.pi * progress) ** 0.72
        for side in range(sides):
            angle = (side / sides) * math.tau
            y = math.cos(angle) * radius
            z = math.sin(angle) * radius
            vertices.append([x, y, z])
            dorsal = max(0.0, math.sin(angle))
            colors.append([224 + int(20 * dorsal), 203 + int(13 * dorsal), 193 + int(13 * dorsal), 242])
    for ring in range(rings - 1):
        for side in range(sides):
            next_side = (side + 1) % sides
            a = ring * sides + side
            b = ring * sides + next_side
            c = (ring + 1) * sides + next_side
            d = (ring + 1) * sides + side
            faces.append([a, b, c])
            faces.append([a, c, d])
    mesh = trimesh.Trimesh(vertices=np.array(vertices), faces=np.array(faces), process=False)
    mesh.visual.vertex_colors = np.array(colors, dtype=np.uint8)
    return mesh


def export_mesh(mesh: trimesh.Trimesh, output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    mesh.export(output, file_type="glb")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sdf", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--max-faces-per-fly-part", type=int, default=1_400)
    args = parser.parse_args()

    fly_parts = load_fly_meshes(args.sdf, args.max_faces_per_fly_part)
    fly = center_scale(trimesh.util.concatenate(fly_parts), target_length=1.9)
    worm = build_worm_mesh()
    fly_path = args.output_dir / "neuromechfly-complete-presentation.glb"
    worm_path = args.output_dir / "openworm-informed-complete-presentation.glb"
    export_mesh(fly, fly_path)
    export_mesh(worm, worm_path)
    report = {
        "fly": {
            "output": str(fly_path),
            "source": "NeuroMechFly component STLs and SDF resting pose",
            "license": "Apache-2.0",
            "vertices": int(len(fly.vertices)),
            "faces": int(len(fly.faces)),
        },
        "worm": {
            "output": str(worm_path),
            "source": "Original low-poly presentation mesh informed by OpenWorm WormBrowser",
            "reference_license": "MIT",
            "vertices": int(len(worm.vertices)),
            "faces": int(len(worm.faces)),
        },
        "runtime_boundary": "Presentation-only GLBs; source topology and modelled motor mapping remain separate.",
    }
    (args.output_dir / "report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
