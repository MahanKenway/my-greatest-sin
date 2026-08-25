"""Print a compact GLB scene graph report without modifying the source asset."""

from __future__ import annotations

import argparse
import json
import struct
from pathlib import Path


JSON_CHUNK = 0x4E4F534A


def glb_json(path: Path) -> dict:
    data = path.read_bytes()
    magic, _version, _length = struct.unpack_from("<III", data, 0)
    if magic != 0x46546C67:
        raise ValueError("Not a GLB file")
    offset = 12
    while offset < len(data):
        chunk_length, chunk_type = struct.unpack_from("<II", data, offset)
        offset += 8
        chunk = data[offset : offset + chunk_length]
        offset += chunk_length
        if chunk_type == JSON_CHUNK:
            return json.loads(chunk.decode("utf-8").rstrip(" \t\r\n\x00"))
    raise ValueError("No JSON chunk in GLB")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    args = parser.parse_args()
    source = glb_json(args.source)
    nodes = []
    for index, node in enumerate(source.get("nodes", [])):
        nodes.append({
            "index": index,
            "name": node.get("name", f"node-{index}"),
            "mesh": node.get("mesh"),
            "skin": node.get("skin"),
            "children": node.get("children", []),
            "translation": node.get("translation"),
            "rotation": node.get("rotation"),
            "scale": node.get("scale"),
            "matrix": node.get("matrix"),
        })
    report = {
        "sceneRoots": source.get("scenes", []),
        "nodeCount": len(nodes),
        "meshCount": len(source.get("meshes", [])),
        "skinCount": len(source.get("skins", [])),
        "animationCount": len(source.get("animations", [])),
        "nodes": nodes,
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
