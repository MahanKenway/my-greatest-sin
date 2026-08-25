"""Render one static inspection image for an imported GLB.

Usage: blender -b --disable-autoexec --python render_gltf_preview.py -- INPUT.glb OUTPUT.png [frame]
   or: blender -b --disable-autoexec SOURCE.blend --python render_gltf_preview.py -- native OUTPUT.png [frame]
The GLB is only imported; native renders use an already-open source file. The
script supplies its own camera/lights and does not run embedded auto-exec content.
"""

from __future__ import annotations

import sys
from pathlib import Path

import bpy
from mathutils import Vector


def bounds_of_meshes() -> tuple[Vector, Vector]:
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("No mesh was imported")
    minimum = Vector((float("inf"),) * 3)
    maximum = Vector((float("-inf"),) * 3)
    for obj in meshes:
        for point in obj.bound_box:
            world = obj.matrix_world @ Vector(point)
            minimum.x = min(minimum.x, world.x)
            minimum.y = min(minimum.y, world.y)
            minimum.z = min(minimum.z, world.z)
            maximum.x = max(maximum.x, world.x)
            maximum.y = max(maximum.y, world.y)
            maximum.z = max(maximum.z, world.z)
    return minimum, maximum


def add_area(location: Vector, energy: float, size: float) -> None:
    data = bpy.data.lights.new("inspection-area", type="AREA")
    data.energy = energy
    data.shape = "DISK"
    data.size = size
    light = bpy.data.objects.new("inspection-area", data)
    bpy.context.collection.objects.link(light)
    light.location = location
    light.rotation_euler = (0.55, 0.0, 0.65)


def main() -> None:
    args = sys.argv[sys.argv.index("--") + 1:]
    if len(args) not in {2, 3}:
        raise SystemExit("Expected INPUT.glb OUTPUT.png [frame]")
    source, destination = args[0], Path(args[1])
    frame = int(args[2]) if len(args) == 3 else 1
    if source != "native":
        bpy.ops.import_scene.gltf(filepath=str(Path(source)))
    armature = next((obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE"), None)
    if armature is not None and bpy.data.actions:
        animation_data = armature.animation_data_create()
        animation_data.action = bpy.data.actions[0]
    bpy.context.scene.frame_set(frame)
    for obj in list(bpy.context.scene.objects):
        if obj.type in {"CAMERA", "LIGHT"} or obj.name in {"Cube", "Icosphere"}:
            bpy.data.objects.remove(obj, do_unlink=True)
    bpy.context.view_layer.update()
    minimum, maximum = bounds_of_meshes()
    center = (minimum + maximum) / 2
    dimensions = maximum - minimum
    span = max(dimensions.length, 0.001)
    camera_data = bpy.data.cameras.new("inspection-camera")
    camera = bpy.data.objects.new("inspection-camera", camera_data)
    bpy.context.collection.objects.link(camera)
    if max(range(3), key=lambda axis: dimensions[axis]) == 1:
        camera.location = center + Vector((span * 1.52, -span * 0.22, span * 0.43))
    else:
        camera.location = center + Vector((span * 0.20, -span * 1.72, span * 0.30))
    camera.rotation_euler = (center - camera.location).to_track_quat("-Z", "Y").to_euler()
    camera.data.lens = 52
    camera.data.clip_start = max(span * 0.001, 0.000001)
    camera.data.clip_end = max(span * 25.0, 1.0)
    bpy.context.scene.camera = camera
    add_area(center + Vector((span, -span, span)), 850, span)
    add_area(center + Vector((-span, -span * 0.25, span * 0.35)), 500, span * 0.8)
    bpy.context.scene.world.color = (0.025, 0.04, 0.06)
    bpy.context.scene.render.engine = "BLENDER_EEVEE"
    bpy.context.scene.render.resolution_x = 720
    bpy.context.scene.render.resolution_y = 560
    bpy.context.scene.render.resolution_percentage = 100
    bpy.context.scene.render.image_settings.file_format = "PNG"
    bpy.context.scene.render.filepath = str(destination)
    for look in ("AgX - Medium High Contrast", "Medium High Contrast"):
        try:
            bpy.context.scene.view_settings.look = look
            break
        except TypeError:
            continue
    destination.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.render.render(write_still=True)
    print(f"Rendered {destination}")


if __name__ == "__main__":
    main()
