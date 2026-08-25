"""Export inspected public Blend assets as focused GLB presentation files.

Usage is deliberately paired with Blender's ``--disable-autoexec`` switch:
  blender -b --disable-autoexec SOURCE.blend --python export_public_specimens.py -- bee OUTPUT.glb
  blender -b --disable-autoexec SOURCE.blend --python export_public_specimens.py -- worm OUTPUT.glb
  blender -b --disable-autoexec SOURCE.blend --python export_public_specimens.py -- neuromechfly OUTPUT.glb

The bee export preserves the source armature, skinning, source materials, and its
existing named Actions. The worm export preserves only WormBase's external
``Cuticle`` surface. That source has no armature or usable action, so the script
adds labelled presentation-only morph targets that move the imported surface; it
never creates a replacement worm mesh or touches connectome data.
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import bpy


def select_only(objects: list[bpy.types.Object]) -> None:
    active = bpy.context.active_object
    if active is not None and active.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")
    # Selection state persists on source objects even when we export a fresh
    # scene.  Deselect globally so hidden helper geometry cannot leak into a
    # selection-only GLB.
    for scene_object in bpy.data.objects:
        scene_object.select_set(False)
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]


def prune_scene(keep: list[bpy.types.Object]) -> None:
    keep_set = set(keep)
    for obj in list(bpy.data.objects):
        if obj not in keep_set:
            bpy.data.objects.remove(obj, do_unlink=True)


def export_glb(output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        use_selection=True,
        export_materials="EXPORT",
        export_animations=True,
        export_animation_mode="ACTIONS",
        export_force_sampling=True,
        export_nla_strips=True,
        export_anim_slide_to_zero=True,
        export_yup=True,
    )


def export_bee(output: Path) -> None:
    armature = bpy.data.objects.get("Armature")
    mesh = bpy.data.objects.get("bee")
    if armature is None or mesh is None:
        raise RuntimeError("Expected source objects Armature and bee")
    for pose_bone in armature.pose.bones:
        pose_bone.custom_shape = None
    prune_scene([armature, mesh])
    select_only([armature, mesh])
    export_glb(output)


def create_worm_wave(surface: bpy.types.Object) -> None:
    surface.shape_key_clear()
    basis = surface.shape_key_add(name="Basis", from_mix=False)
    coordinates = [vertex.co.copy() for vertex in surface.data.vertices]
    minimum = [min(coordinate[axis] for coordinate in coordinates) for axis in range(3)]
    maximum = [max(coordinate[axis] for coordinate in coordinates) for axis in range(3)]
    spans = [maximum[axis] - minimum[axis] for axis in range(3)]
    long_axis = max(range(3), key=spans.__getitem__)
    side_axis = sorted(range(3), key=spans.__getitem__)[-2]
    amplitude = spans[side_axis] * 0.18
    phases = (0.0, math.pi / 2, math.pi, 3 * math.pi / 2)
    keys = []
    for index, phase in enumerate(phases):
        key = surface.shape_key_add(name=f"modelled_body_wave_{index}", from_mix=False)
        for vertex_index, coordinate in enumerate(coordinates):
            progress = (coordinate[long_axis] - minimum[long_axis]) / max(spans[long_axis], 1e-6)
            envelope = math.sin(progress * math.pi)
            offset = math.sin(progress * math.pi * 3.0 + phase) * envelope * amplitude
            key.data[vertex_index].co[side_axis] = coordinate[side_axis] + offset
        keys.append(key)
    shape_keys = surface.data.shape_keys
    shape_keys.animation_data_create()
    action = bpy.data.actions.new("MODELLED_C_ELEGANS_BODY_WAVE")
    shape_keys.animation_data.action = action
    frames = (1.0, 7.0, 13.0, 19.0, 25.0)
    indices = (0, 1, 2, 3, 0)
    for key in keys:
        key.value = 0.0
        key.keyframe_insert(data_path="value", frame=1.0)
    for frame, active in zip(frames, indices):
        for index, key in enumerate(keys):
            key.value = 1.0 if index == active else 0.0
            key.keyframe_insert(data_path="value", frame=frame)
    for curve in action.fcurves:
        for point in curve.keyframe_points:
            point.interpolation = "LINEAR"
    surface["presentation_provenance"] = "MODELLED MAPPING"
    surface["source_surface"] = "WormBase Virtual Worm Cuticle"
    basis.name = "Basis"


def export_worm(output: Path) -> None:
    surface = bpy.data.objects.get("Cuticle")
    if surface is None or surface.type != "MESH":
        raise RuntimeError("Expected a Cuticle mesh in the Virtual Worm source")
    prune_scene([surface])
    create_worm_wave(surface)
    select_only([surface])
    export_glb(output)


def set_frame_value(pose_bone: bpy.types.PoseBone, frame: float, rotation: tuple[float, float, float], location_z: float = 0.0) -> None:
    pose_bone.rotation_mode = "XYZ"
    pose_bone.rotation_euler = rotation
    pose_bone.location.z = location_z
    pose_bone.keyframe_insert(data_path="rotation_euler", frame=frame)
    if pose_bone.name == "Thorax":
        pose_bone.keyframe_insert(data_path="location", frame=frame)


def finalize_action(action: bpy.types.Action) -> None:
    for curve in action.fcurves:
        for point in curve.keyframe_points:
            point.interpolation = "LINEAR"


def create_neuromechfly_actions(armature: bpy.types.Object) -> None:
    animation_data = armature.animation_data_create()
    armature.data.pose_position = "POSE"
    leg_prefixes = ("LF", "LM", "LH", "RF", "RM", "RH")
    for action_name, wing_angle, stride_angle, thorax_bob in (
        ("MODELLED_NMF_HOVER", 0.66, 0.10, 0.025),
        ("MODELLED_NMF_WALK", 0.22, 0.42, 0.008),
    ):
        action = bpy.data.actions.new(action_name)
        animation_data.action = action
        for frame, phase in ((1.0, -1.0), (6.0, 1.0), (11.0, -1.0), (16.0, 1.0), (21.0, -1.0)):
            set_frame_value(armature.pose.bones["Thorax"], frame, (0.0, 0.0, 0.0), thorax_bob if phase > 0 else 0.0)
            set_frame_value(armature.pose.bones["LWing"], frame, (0.0, phase * wing_angle, 0.0))
            set_frame_value(armature.pose.bones["RWing"], frame, (0.0, -phase * wing_angle, 0.0))
            set_frame_value(armature.pose.bones["LHaltere"], frame, (0.0, -phase * wing_angle * 0.12, 0.0))
            set_frame_value(armature.pose.bones["RHaltere"], frame, (0.0, phase * wing_angle * 0.12, 0.0))
            for index, prefix in enumerate(leg_prefixes):
                leg_phase = phase if index % 2 == 0 else -phase
                for bone_suffix, magnitude in (("Coxa", 0.38), ("Femur", 0.31), ("Tibia", 0.27)):
                    bone = armature.pose.bones.get(f"{prefix}{bone_suffix}")
                    if bone is not None:
                        set_frame_value(bone, frame, (leg_phase * stride_angle * magnitude, 0.0, 0.0))
        finalize_action(action)
    animation_data.action = bpy.data.actions["MODELLED_NMF_HOVER"]


def apply_neuromechfly_materials(meshes: list[bpy.types.Object]) -> None:
    cuticle = bpy.data.materials.new("NeuroMechFly_Cuticle_Presentation")
    cuticle.diffuse_color = (0.12, 0.035, 0.012, 1.0)
    cuticle.use_nodes = True
    principled = cuticle.node_tree.nodes.get("Principled BSDF")
    if principled:
        principled.inputs["Base Color"].default_value = (0.12, 0.035, 0.012, 1.0)
        principled.inputs["Roughness"].default_value = 0.62
        principled.inputs["Metallic"].default_value = 0.04
    for mesh in meshes:
        if len(mesh.data.materials) == 0:
            mesh.data.materials.append(cuticle)


def create_neuromechfly_pivots(armature: bpy.types.Object, collection: bpy.types.Collection) -> list[bpy.types.Object]:
    """Emit rest-pose joint coordinates as non-rendering glTF nodes.

    The public source has a true armature but no authored animation action.  The
    browser derivative therefore ships the source part geometry separately, plus
    exact rest-pose bone transforms, so presentation-only movement can rotate
    real source parts around their real source joint locations.
    """
    pivots: list[bpy.types.Object] = []
    for bone in armature.data.bones:
        pivot = bpy.data.objects.new(f"nmf_pivot__{bone.name}", None)
        pivot.empty_display_type = "PLAIN_AXES"
        pivot.empty_display_size = 0.00001
        pivot.matrix_world = armature.matrix_world @ bone.matrix_local
        pivot["source_joint"] = bone.name
        collection.objects.link(pivot)
        pivots.append(pivot)
    return pivots


def parent_parts_to_source_joints(armature: bpy.types.Object, meshes: list[bpy.types.Object]) -> None:
    for mesh in meshes:
        source_bone = mesh.name
        bone = armature.pose.bones.get(source_bone)
        if bone is None:
            continue
        world = mesh.matrix_world.copy()
        mesh.parent = None
        mesh.matrix_world = world
        mesh.parent = armature
        mesh.parent_type = "BONE"
        mesh.parent_bone = source_bone
        mesh.matrix_world = world
        mesh.name = f"part__{source_bone}"


def export_neuromechfly(output: Path) -> None:
    armature = bpy.data.objects.get("Armature")
    if armature is None:
        raise RuntimeError("Expected an Armature in the NeuroMechFly source")
    source_meshes = [
        obj
        for obj in bpy.data.objects
        if obj.type == "MESH" and obj.name in armature.pose.bones and obj.name not in {"Cube", "Icosphere"}
    ]
    if len(source_meshes) < 50:
        raise RuntimeError("Expected the complete NeuroMechFly articulated mesh set")

    # The published Blend stores many valid articulated parts in collections that
    # are not linked to its current view layer.  Selection-only glTF exports then
    # silently emit just the six visible parts.  Copy each source mesh into a fresh
    # scene with its evaluated rest-pose world transform.  Geometry is unchanged;
    # this only makes the original source parts visible to the open glTF exporter.
    export_scene = bpy.data.scenes.new("NeuroMechFly_Presentation_Export")
    bpy.context.window.scene = export_scene
    export_collection = bpy.data.collections.new("NeuroMechFly_Source_Parts")
    export_scene.collection.children.link(export_collection)
    meshes: list[bpy.types.Object] = []
    for source_mesh in source_meshes:
        source_joint = source_mesh.name
        mesh = bpy.data.objects.new(f"nmf__{source_joint}", source_mesh.data.copy())
        mesh.matrix_world = source_mesh.matrix_world.copy()
        mesh.hide_viewport = False
        mesh.hide_render = False
        mesh["source_joint"] = source_joint
        export_collection.objects.link(mesh)
        meshes.append(mesh)
    apply_neuromechfly_materials(meshes)
    pivots = create_neuromechfly_pivots(armature, export_collection)
    select_only(meshes + pivots)
    export_glb(output)


def main() -> None:
    arguments = sys.argv[sys.argv.index("--") + 1:]
    if len(arguments) != 2 or arguments[0] not in {"bee", "worm", "neuromechfly"}:
        raise SystemExit("Expected: bee|worm|neuromechfly OUTPUT.glb")
    kind, output_string = arguments
    output = Path(output_string)
    if kind == "bee":
        export_bee(output)
    elif kind == "worm":
        export_worm(output)
    else:
        export_neuromechfly(output)
    print(f"Exported {kind} to {output}")


if __name__ == "__main__":
    main()
