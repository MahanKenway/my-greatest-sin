"""Import a GLB into an empty Blender process and emit a concise JSON inventory.

Run with: blender -b --python inspect_gltf_scene.py -- INPUT.glb OUTPUT.json
No content embedded in INPUT is executed; this script only invokes Blender's glTF importer.
"""

from __future__ import annotations

import json
import sys

import bpy
from mathutils import Vector


def main() -> None:
    arguments = sys.argv[sys.argv.index("--") + 1:]
    if len(arguments) != 2:
        raise SystemExit("Expected INPUT.glb OUTPUT.json")
    source, output = arguments
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    bpy.ops.import_scene.gltf(filepath=source)
    objects = []
    for obj in bpy.data.objects:
        entry = {"name": obj.name, "type": obj.type, "parent": obj.parent.name if obj.parent else None}
        if obj.type == "MESH":
            corners = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
            minimum = [min(corner[axis] for corner in corners) for axis in range(3)]
            maximum = [max(corner[axis] for corner in corners) for axis in range(3)]
            entry["vertices"] = len(obj.data.vertices)
            entry["polygons"] = len(obj.data.polygons)
            entry["dataName"] = obj.data.name
            entry["worldBounds"] = {"min": minimum, "max": maximum}
            entry["materials"] = [material.name if material else None for material in obj.data.materials]
            entry["armatureModifiers"] = [modifier.object.name for modifier in obj.modifiers if modifier.type == "ARMATURE" and modifier.object]
        elif obj.type == "ARMATURE":
            entry["bones"] = [bone.name for bone in obj.data.bones]
        objects.append(entry)
    report = {
        "objects": objects,
        "meshCount": sum(1 for entry in objects if entry["type"] == "MESH"),
        "meshPolygons": sum(entry.get("polygons", 0) for entry in objects),
        "armatures": [entry for entry in objects if entry["type"] == "ARMATURE"],
        "actions": [{"name": action.name, "fcurves": len(action.fcurves), "frameRange": list(map(float, action.frame_range))} for action in bpy.data.actions],
    }
    with open(output, "w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)
    print(json.dumps({"meshCount": report["meshCount"], "armatureCount": len(report["armatures"]), "actionCount": len(report["actions"]), "output": output}))


if __name__ == "__main__":
    main()
