"""Inspect a GLB locally without altering it.

The report is intentionally metadata-only: it records render complexity and
attribution-relevant structure before an uploaded model is decimated for web
delivery. It never copies an input asset into the source tree.
"""

from __future__ import annotations

import json
import struct
import sys
from pathlib import Path


COMPONENT_SIZES = {5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4}
TYPE_COMPONENTS = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT2": 4, "MAT3": 9, "MAT4": 16}


def read_glb(path: Path) -> dict:
    data = path.read_bytes()
    magic, version, length = struct.unpack_from("<4sII", data, 0)
    if magic != b"glTF" or version != 2 or length != len(data):
        raise ValueError(f"{path} is not a valid glTF 2 binary file")
    offset = 12
    json_length, json_type = struct.unpack_from("<I4s", data, offset)
    if json_type != b"JSON":
        raise ValueError(f"{path} has no JSON chunk")
    return json.loads(data[offset + 8 : offset + 8 + json_length].decode("utf-8"))


def primitive_triangles(primitive: dict, accessors: list[dict]) -> int:
    if primitive.get("mode", 4) != 4:
        return 0
    if "indices" in primitive:
        return int(accessors[primitive["indices"]]["count"]) // 3
    position = primitive.get("attributes", {}).get("POSITION")
    return int(accessors[position]["count"]) // 3 if position is not None else 0


def accessor_bounds(accessor: dict) -> dict | None:
    if "min" not in accessor or "max" not in accessor:
        return None
    return {"min": accessor["min"], "max": accessor["max"]}


def inspect(path: Path) -> dict:
    gltf = read_glb(path)
    accessors = gltf.get("accessors", [])
    mesh_details = []
    triangles = 0
    vertices = 0
    for mesh_index, mesh in enumerate(gltf.get("meshes", [])):
        mesh_triangles = 0
        mesh_vertices = 0
        primitive_details = []
        for primitive in mesh.get("primitives", []):
            position = primitive.get("attributes", {}).get("POSITION")
            count = int(accessors[position]["count"]) if position is not None else 0
            primitive_count = primitive_triangles(primitive, accessors)
            mesh_triangles += primitive_count
            mesh_vertices += count
            primitive_details.append(
                {
                    "triangles": primitive_count,
                    "vertices": count,
                    "material": primitive.get("material"),
                    "bounds": accessor_bounds(accessors[position]) if position is not None else None,
                }
            )
        triangles += mesh_triangles
        vertices += mesh_vertices
        mesh_details.append(
            {"index": mesh_index, "name": mesh.get("name", f"mesh-{mesh_index}"), "triangles": mesh_triangles, "vertices": mesh_vertices, "primitives": primitive_details}
        )
    image_bytes = sum(image.get("byteLength", 0) for image in gltf.get("images", []))
    return {
        "file": path.name,
        "bytes": path.stat().st_size,
        "generator": gltf.get("asset", {}).get("generator"),
        "sceneCount": len(gltf.get("scenes", [])),
        "nodeCount": len(gltf.get("nodes", [])),
        "meshCount": len(gltf.get("meshes", [])),
        "materialCount": len(gltf.get("materials", [])),
        "imageCount": len(gltf.get("images", [])),
        "embeddedImageBytes": image_bytes,
        "vertexCount": vertices,
        "triangleCount": triangles,
        "meshDetails": mesh_details,
    }


if __name__ == "__main__":
    reports = [inspect(Path(value)) for value in sys.argv[1:]]
    print(json.dumps(reports, indent=2))
