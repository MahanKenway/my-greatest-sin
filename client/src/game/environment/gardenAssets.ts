/** Luminous Connectome Lab: CC0 garden-model URLs are presentation assets only, never scientific source data. */
export const GARDEN_ASSETS = {
  oakTree: "/manus-storage/tree_oak_9d2301a6.glb",
  pineTree: "/manus-storage/tree_pineTallA_af64a6cf.glb",
  smallTree: "/manus-storage/tree_small_17c2d646.glb",
  bush: "/manus-storage/plant_bushDetailed_efb98a94.glb",
  leafGrass: "/manus-storage/grass_leafsLarge_4372d832.glb",
  grass: "/manus-storage/grass_3eb421ad.glb",
  largeRock: "/manus-storage/rock_largeB_eb4266dc.glb",
  smallRock: "/manus-storage/rock_smallD_66f5bfa0.glb",
  lily: "/manus-storage/lily_large_181c05b2.glb",
  mushrooms: "/manus-storage/mushroom_redGroup_d0504fa5.glb",
  log: "/manus-storage/log_large_4d9cd662.glb",
  purpleFlower: "/manus-storage/flower_purpleA_db3cc681.glb",
  redFlower: "/manus-storage/flower_redB_d58217af.glb",
  yellowFlower: "/manus-storage/flower_yellowC_35b25b2b.glb",
  stonePath: "/manus-storage/path_stone_fde6ed5e.glb",
  stonePathCircle: "/manus-storage/path_stoneCircle_dae573d4.glb",
  woodenBridge: "/manus-storage/bridge_woodRound_31f2ae7d.glb",
} as const;

export type GardenAssetKey = keyof typeof GARDEN_ASSETS;
