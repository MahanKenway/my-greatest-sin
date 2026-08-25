"""Create presentation-only replacement GLBs after local model review.

The FlyBody mode must be run against its public Blender source with auto-exec
disabled. It preserves the real source-part rest pose and source-joint hierarchy.
The C. elegans mode deliberately creates a handcrafted visual body only; its
travelling wave is stored as MODELLED MAPPING and is never source behaviour.

Usage:
  blender -b --disable-autoexec drosophila.blend --python export_replacement_specimens.py -- flybody OUTPUT.glb
  blender -b --disable-autoexec --python export_replacement_specimens.py -- modelled-worm OUTPUT.glb
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def deselect_all() -> None:
    for scene_object in bpy.context.scene.objects:
        scene_object.select_set(False)


def select_for_export(objects: list[bpy.types.Object]) -> None:
    deselect_all()
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]


def export_glb(output: Path, objects: list[bpy.types.Object]) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    select_for_export(objects)
    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        use_selection=True,
        export_materials="EXPORT",
        export_animations=True,
        export_animation_mode="ACTIONS",
        export_force_sampling=True,
        export_morph=True,
        export_extras=True,
        export_yup=True,
    )


def export_flybody(output: Path) -> None:
    armature = bpy.data.objects.get("Armature")
    if armature is None or armature.type != "ARMATURE":
        raise RuntimeError("Expected FlyBody Armature")
    source_meshes = [
        obj
        for obj in bpy.data.objects
        if obj.type == "MESH" and obj.parent is armature and obj.parent_type == "BONE" and obj.parent_bone
    ]
    if len(source_meshes) < 60:
        raise RuntimeError("Expected complete FlyBody source-part collection")

    export_scene = bpy.data.scenes.new("FlyBody_Presentation_Export")
    bpy.context.window.scene = export_scene
    collection = bpy.data.collections.new("FlyBody_Source_Parts")
    export_scene.collection.children.link(collection)

    pivots: dict[str, bpy.types.Object] = {}
    for bone in armature.data.bones:
        pivot = bpy.data.objects.new(f"fb_pivot__{bone.name}", None)
        pivot.empty_display_type = "PLAIN_AXES"
        pivot.empty_display_size = 0.00001
        pivot.matrix_world = armature.matrix_world @ bone.matrix_local
        pivot["source_joint"] = bone.name
        pivot["presentation_provenance"] = "FlyBody Apache-2.0 source joint"
        collection.objects.link(pivot)
        pivots[bone.name] = pivot
    for bone in armature.data.bones:
        if bone.parent is not None:
            pivot = pivots[bone.name]
            world = pivot.matrix_world.copy()
            pivot.parent = pivots[bone.parent.name]
            pivot.matrix_world = world

    meshes: list[bpy.types.Object] = []
    for source in source_meshes:
        mesh = bpy.data.objects.new(f"fb__{source.name}", source.data.copy())
        mesh.matrix_world = source.matrix_world.copy()
        mesh["source_joint"] = source.parent_bone
        mesh["presentation_provenance"] = "FlyBody Apache-2.0 source geometry"
        collection.objects.link(mesh)
        world = mesh.matrix_world.copy()
        mesh.parent = pivots[source.parent_bone]
        mesh.matrix_world = world
        meshes.append(mesh)

    export_glb(output, meshes + list(pivots.values()))
    print(f"Exported FlyBody source geometry: {len(meshes)} meshes / {len(pivots)} pivots -> {output}")


def make_material(name: str, color: tuple[float, float, float, float], roughness: float) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    principled = material.node_tree.nodes.get("Principled BSDF")
    if principled is not None:
        principled.inputs["Base Color"].default_value = color
        principled.inputs["Roughness"].default_value = roughness
        principled.inputs["Specular IOR Level"].default_value = 0.28
    material.diffuse_color = color
    return material


def ring_radius(progress: float) -> tuple[float, float]:
    """An adult C. elegans-inspired silhouette: defined head, fuller midbody, tapered tail."""
    if progress < 0.09:
        width = 0.13 + progress / 0.09 * 0.17
    elif progress < 0.24:
        width = 0.30 + (progress - 0.09) / 0.15 * 0.15
    elif progress < 0.78:
        width = 0.45 - (progress - 0.24) * 0.10
    else:
        width = max(0.035, 0.40 * (1.0 - (progress - 0.78) / 0.22) + 0.025)
    return width, width * 0.73


def append_uv_sphere(
    vertices: list[tuple[float, float, float]],
    faces: list[tuple[int, ...]],
    material_slots: list[int],
    center: tuple[float, float, float],
    radii: tuple[float, float, float],
    material_index: int,
    longitude: int = 12,
    latitude: int = 7,
) -> None:
    start = len(vertices)
    for lat in range(latitude + 1):
        theta = math.pi * lat / latitude
        for lon in range(longitude):
            phi = math.tau * lon / longitude
            vertices.append(
                (
                    center[0] + radii[0] * math.cos(theta),
                    center[1] + radii[1] * math.sin(theta) * math.cos(phi),
                    center[2] + radii[2] * math.sin(theta) * math.sin(phi),
                )
            )
    for lat in range(latitude):
        for lon in range(longitude):
            nxt = (lon + 1) % longitude
            faces.append((start + lat * longitude + lon, start + lat * longitude + nxt, start + (lat + 1) * longitude + nxt, start + (lat + 1) * longitude + lon))
            material_slots.append(material_index)


def create_modelled_worm(output: Path) -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    body = make_material("celegans_soft_cuticle", (0.36, 0.66, 0.50, 1.0), 0.58)
    head = make_material("celegans_head_collar", (0.60, 0.82, 0.63, 1.0), 0.50)
    bands = make_material("celegans_subtle_annuli", (0.23, 0.47, 0.35, 1.0), 0.64)
    sensory = make_material("celegans_sensory_pores", (0.06, 0.12, 0.10, 1.0), 0.40)
    pharynx = make_material("celegans_pharynx_hint", (0.84, 0.70, 0.43, 1.0), 0.40)
    materials = [body, head, bands, sensory, pharynx]

    vertices: list[tuple[float, float, float]] = []
    faces: list[tuple[int, ...]] = []
    material_slots: list[int] = []
    rings, sides, length = 104, 20, 6.65
    for ring in range(rings):
        progress = ring / (rings - 1)
        x = length * (progress - 0.5)
        radius_y, radius_z = ring_radius(progress)
        dorsal_ridge = 0.025 * math.exp(-((progress - 0.42) / 0.30) ** 2)
        for side in range(sides):
            angle = math.tau * side / sides
            vertices.append((x, radius_y * math.cos(angle), radius_z * math.sin(angle) + dorsal_ridge))
    for ring in range(rings - 1):
        progress = ring / (rings - 1)
        face_material = 1 if progress < 0.12 else 2 if ring % 7 == 0 else 0
        for side in range(sides):
            nxt = (side + 1) % sides
            faces.append((ring * sides + side, ring * sides + nxt, (ring + 1) * sides + nxt, (ring + 1) * sides + side))
            material_slots.append(face_material)

    # The head is authored at -X as part of the continuous surface: its collar
    # material and broader, rounded front give orientation without separate props.

    mesh_data = bpy.data.meshes.new("celegans_modelled_continuous_surface")
    mesh_data.from_pydata(vertices, [], faces)
    mesh_data.materials.clear()
    for material in materials:
        mesh_data.materials.append(material)
    for face, slot in zip(mesh_data.polygons, material_slots):
        face.material_index = slot
        face.use_smooth = True
    mesh_data.update()

    surface = bpy.data.objects.new("celegans_modelled_continuous_body", mesh_data)
    bpy.context.collection.objects.link(surface)
    surface["presentation_provenance"] = "MODELLED MAPPING — handcrafted C. elegans body"
    surface["motion_boundary"] = "Travelling-wave motion is presentation only; source topology remains separate"
    create_body_wave(surface)
    export_glb(output, [surface])
    print(f"Exported modelled C. elegans visual body: {len(mesh_data.vertices)} vertices / {len(mesh_data.polygons)} polygons -> {output}")


def create_body_wave(surface: bpy.types.Object) -> None:
    basis = surface.shape_key_add(name="Basis", from_mix=False)
    coordinates = [vertex.co.copy() for vertex in surface.data.vertices]
    minimum_x = min(coordinate.x for coordinate in coordinates)
    maximum_x = max(coordinate.x for coordinate in coordinates)
    span = max(maximum_x - minimum_x, 1e-6)
    phases = (0.0, math.pi / 2, math.pi, math.pi * 1.5)
    keys = []
    for index, phase in enumerate(phases):
        key = surface.shape_key_add(name=f"modelled_body_wave_{index}", from_mix=False)
        for vertex_index, coordinate in enumerate(coordinates):
            progress = (coordinate.x - minimum_x) / span
            envelope = math.sin(progress * math.pi) ** 1.15
            offset = math.sin(progress * math.pi * 4.2 + phase) * envelope * 0.20
            key.data[vertex_index].co.y = coordinate.y + offset
        keys.append(key)
    shape_keys = surface.data.shape_keys
    shape_keys.animation_data_create()
    action = bpy.data.actions.new("MODELLED_C_ELEGANS_BODY_WAVE")
    shape_keys.animation_data.action = action
    for key in keys:
        key.value = 0.0
        key.keyframe_insert(data_path="value", frame=1.0)
    for frame, active in zip((1.0, 8.0, 15.0, 22.0, 29.0), (0, 1, 2, 3, 0)):
        for index, key in enumerate(keys):
            key.value = 1.0 if index == active else 0.0
            key.keyframe_insert(data_path="value", frame=frame)
    for curve in action.fcurves:
        for point in curve.keyframe_points:
            point.interpolation = "LINEAR"
    basis.name = "Basis"


def main() -> None:
    arguments = sys.argv[sys.argv.index("--") + 1 :]
    if len(arguments) != 2 or arguments[0] not in {"flybody", "modelled-worm"}:
        raise SystemExit("Expected: flybody|modelled-worm OUTPUT.glb")
    kind, output_string = arguments
    output = Path(output_string)
    if kind == "flybody":
        export_flybody(output)
    else:
        create_modelled_worm(output)


if __name__ == "__main__":
    main()
