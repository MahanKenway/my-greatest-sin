"""Render a public OBJ candidate in a controlled Blender inspection scene.

Usage:
  blender -b --disable-autoexec --python render_obj_preview.py -- INPUT.obj OUTPUT.png
"""

from __future__ import annotations

import sys
from pathlib import Path

import bpy
from mathutils import Vector


def bounds() -> tuple[Vector, Vector]:
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("OBJ import produced no mesh")
    minimum = Vector((float("inf"),) * 3)
    maximum = Vector((float("-inf"),) * 3)
    for obj in meshes:
        for corner in obj.bound_box:
            point = obj.matrix_world @ Vector(corner)
            minimum = Vector((min(minimum.x, point.x), min(minimum.y, point.y), min(minimum.z, point.z)))
            maximum = Vector((max(maximum.x, point.x), max(maximum.y, point.y), max(maximum.z, point.z)))
    return minimum, maximum


def area(location: Vector, energy: float, size: float) -> None:
    light_data = bpy.data.lights.new("candidate-inspection-area", type="AREA")
    light_data.energy = energy
    light_data.shape = "DISK"
    light_data.size = size
    light = bpy.data.objects.new("candidate-inspection-area", light_data)
    bpy.context.collection.objects.link(light)
    light.location = location


def main() -> None:
    arguments = sys.argv[sys.argv.index("--") + 1 :]
    if len(arguments) != 2:
        raise SystemExit("Expected INPUT.obj OUTPUT.png")
    source, destination = Path(arguments[0]), Path(arguments[1])
    bpy.ops.wm.obj_import(filepath=str(source))
    minimum, maximum = bounds()
    center = (minimum + maximum) / 2
    span = max((maximum - minimum).length, 0.001)

    camera_data = bpy.data.cameras.new("candidate-inspection-camera")
    camera = bpy.data.objects.new("candidate-inspection-camera", camera_data)
    bpy.context.collection.objects.link(camera)
    camera.location = center + Vector((span * 0.95, -span * 1.75, span * 0.55))
    camera.rotation_euler = (center - camera.location).to_track_quat("-Z", "Y").to_euler()
    camera.data.lens = 52
    camera.data.clip_start = max(span * 0.001, 0.000001)
    camera.data.clip_end = span * 25
    bpy.context.scene.camera = camera

    area(center + Vector((span, -span, span)), 850, span)
    area(center + Vector((-span, -span * 0.2, span * 0.4)), 450, span * 0.8)
    bpy.context.scene.world.color = (0.025, 0.04, 0.06)
    bpy.context.scene.render.engine = "BLENDER_EEVEE"
    bpy.context.scene.render.resolution_x = 720
    bpy.context.scene.render.resolution_y = 560
    bpy.context.scene.render.resolution_percentage = 100
    bpy.context.scene.render.image_settings.file_format = "PNG"
    bpy.context.scene.render.filepath = str(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.render.render(write_still=True)
    print(f"Rendered {destination}")


if __name__ == "__main__":
    main()
