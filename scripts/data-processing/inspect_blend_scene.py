"""Emit a JSON inventory of a Blender scene without running embedded auto-exec code.

Run with: blender -b --disable-autoexec INPUT.blend --python inspect_blend_scene.py -- OUTPUT.json
The script only reads Blender data blocks and never saves or mutates the input.
"""

from __future__ import annotations

import json
import sys

import bpy


def action_summary(action: bpy.types.Action) -> dict:
    channels = set()
    for curve in action.fcurves:
        channels.add(curve.data_path)
    return {
        "name": action.name,
        "frameRange": [float(action.frame_range[0]), float(action.frame_range[1])],
        "fcurves": len(action.fcurves),
        "channels": sorted(channels),
    }


def main() -> None:
    output = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "blend-scene-report.json"
    objects = []
    for obj in bpy.data.objects:
        entry = {
            "name": obj.name,
            "type": obj.type,
            "hidden": bool(obj.hide_viewport),
            "parent": obj.parent.name if obj.parent else None,
            "parentType": obj.parent_type,
            "parentBone": obj.parent_bone if obj.parent_type == "BONE" else None,
        }
        if obj.type == "MESH":
            entry.update({
                "vertices": len(obj.data.vertices),
                "polygons": len(obj.data.polygons),
                "materials": [material.name if material else None for material in obj.data.materials],
                "armatureModifiers": [modifier.object.name for modifier in obj.modifiers if modifier.type == "ARMATURE" and modifier.object],
            })
        elif obj.type == "ARMATURE":
            entry["bones"] = [bone.name for bone in obj.data.bones]
        objects.append(entry)
    report = {
        "blenderVersion": bpy.app.version_string,
        "objects": objects,
        "armatures": [entry for entry in objects if entry["type"] == "ARMATURE"],
        "meshCount": sum(1 for entry in objects if entry["type"] == "MESH"),
        "meshVertices": sum(entry.get("vertices", 0) for entry in objects),
        "meshPolygons": sum(entry.get("polygons", 0) for entry in objects),
        "materials": sorted(material.name for material in bpy.data.materials),
        "actions": [action_summary(action) for action in bpy.data.actions],
    }
    with open(output, "w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)
    print(json.dumps({
        "meshCount": report["meshCount"],
        "meshPolygons": report["meshPolygons"],
        "armatureCount": len(report["armatures"]),
        "actionCount": len(report["actions"]),
        "output": output,
    }))


if __name__ == "__main__":
    main()
