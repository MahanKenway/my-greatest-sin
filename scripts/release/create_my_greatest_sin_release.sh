#!/usr/bin/env bash
# My Greatest Sin release builder: produces portable, data-free artifacts outside the repository.
# It never copies actual FlyWire source data or a real DFLY pack.
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUTPUT_ROOT="${1:-/home/ubuntu/my-greatest-sin-release-v0.1.0}"
ASSET_ROOT="/home/ubuntu/webdev-static-assets"
SOURCE_STAGE="$OUTPUT_ROOT/my-greatest-sin-source-v0.1.0"
SPACE_STAGE="$OUTPUT_ROOT/hf-space"
DATASET_STAGE="$OUTPUT_ROOT/hf-dataset"
ZENODO_STAGE="$OUTPUT_ROOT/zenodo"

rm -rf "$OUTPUT_ROOT"
mkdir -p "$SOURCE_STAGE" "$SPACE_STAGE" "$DATASET_STAGE" "$ZENODO_STAGE"

tar --exclude='.git' --exclude='node_modules' --exclude='dist' --exclude='.manus-logs' --exclude='__pycache__' --exclude='.project-config.json' --exclude='client/public/__manus__' --exclude='todo.md' --exclude='docs/FREE_HOSTING_RESEARCH.md' --exclude='docs/MY_GREATEST_SIN_RELEASE.md' --exclude='scripts/release' -C "$PROJECT_ROOT" -cf - . | tar -C "$SOURCE_STAGE" -xf -

mkdir -p "$SOURCE_STAGE/client/public/assets"
cp "$ASSET_ROOT/digital-fly-mark.png" "$SOURCE_STAGE/client/public/assets/digital-fly-mark.png"
cp "$ASSET_ROOT/digital-fly-brain-map.png" "$SOURCE_STAGE/client/public/assets/digital-fly-brain-map.png"
cp "$ASSET_ROOT/digital-fly-specimen-floor.png" "$SOURCE_STAGE/client/public/assets/digital-fly-specimen-floor.png"
cp "$ASSET_ROOT/digital-fly-visual-target.png" "$SOURCE_STAGE/client/public/assets/digital-fly-visual-target.png"
cp "$ASSET_ROOT/digital-fly-wing-texture.png" "$SOURCE_STAGE/client/public/assets/digital-fly-wing-texture.png"

sed -i \
  -e 's#/manus-storage/digital-fly-mark_36065411.png#/assets/digital-fly-mark.png#g' \
  -e 's#/manus-storage/digital-fly-brain-map_8c20bc49.png#/assets/digital-fly-brain-map.png#g' \
  -e 's#/manus-storage/digital-fly-specimen-floor_c2cc3595.png#/assets/digital-fly-specimen-floor.png#g' \
  -e 's#/manus-storage/digital-fly-visual-target_03e6dd46.png#/assets/digital-fly-visual-target.png#g' \
  -e 's#/manus-storage/digital-fly-wing-texture_02c80633.png#/assets/digital-fly-wing-texture.png#g' \
  "$SOURCE_STAGE/client/index.html" \
  "$SOURCE_STAGE/client/src/components/SimulationHud.tsx" \
  "$SOURCE_STAGE/client/src/game/environment/Arena.ts" \
  "$SOURCE_STAGE/ASSETS.md"

sed -i 's#The generated assets are stored outside the repository and referenced only through the stable manuscript storage URLs above.#The generated assets are included in `client/public/assets/` for this portable release.#' "$SOURCE_STAGE/ASSETS.md"

rm -f "$SOURCE_STAGE/client/index.html".bak
ln -s "$PROJECT_ROOT/node_modules" "$SOURCE_STAGE/node_modules"
(cd "$SOURCE_STAGE" && pnpm build)
rm "$SOURCE_STAGE/node_modules"

cp -R "$SOURCE_STAGE/dist/public/." "$SPACE_STAGE/"
cat > "$SPACE_STAGE/README.md" <<'EOF'
---
title: My Greatest Sin
emoji: 🧠
colorFrom: gray
colorTo: pink
sdk: static
pinned: false
---

# My Greatest Sin

Browser-first connectome observation software with a deterministic synthetic fixture. This Space does not contain or execute a FlyWire data pack.
EOF

cat > "$DATASET_STAGE/README.md" <<'EOF'
---
language:
- en
license: mit
tags:
- drosophila
- connectomics
- neuroscience
- simulation
- webgpu
---

# My Greatest Sin — DFLY Registry

This repository accompanies **My Greatest Sin**, a browser-first connectome observation software project. Version `0.1.0` contains a portable source release and DFLY format documentation only.

## Data boundary

No FlyWire source data, derivative connectivity, morphology, annotations, or transformed DFLY pack is included in this revision. The running application uses an explicitly labelled 96-neuron synthetic test fixture. Any later dataset addition must preserve the FlyWire release, licence, citations, checksums, and transformation provenance.

## Included release artifact

`my-greatest-sin-source-v0.1.0.zip` contains source code, generated visual assets, tests, the DFLY v1 contract, and a local conversion utility. The code is MIT-licensed; it does not grant rights to FlyWire data.
EOF

cat > "$ZENODO_STAGE/zenodo-metadata.json" <<'EOF'
{
  "metadata": {
    "title": "My Greatest Sin: Digital Fly Connectome Simulation Foundation",
    "upload_type": "software",
    "publication_date": "2026-08-22",
    "description": "Browser-first connectome observation software with a deterministic synthetic fixture, a DFLY v1 provenance contract, and local conversion tooling for separately user-obtained data. This release contains no FlyWire data or transformed DFLY pack.",
    "creators": [{"name": "Tavakoli, Mahan"}],
    "license": "MIT",
    "keywords": ["Drosophila", "connectomics", "neuroscience", "simulation", "WebGPU", "Babylon.js"],
    "related_identifiers": [{"identifier": "https://github.com/MahanKenway/digital-fly", "relation": "isSupplementTo", "resource_type": "software"}]
  }
}
EOF

rm -rf "$SOURCE_STAGE/dist"
(cd "$OUTPUT_ROOT" && zip -qr "my-greatest-sin-source-v0.1.0.zip" "$(basename "$SOURCE_STAGE")")
cp "$OUTPUT_ROOT/my-greatest-sin-source-v0.1.0.zip" "$DATASET_STAGE/"
cp "$OUTPUT_ROOT/my-greatest-sin-source-v0.1.0.zip" "$ZENODO_STAGE/"
cp "$PROJECT_ROOT/LICENSE" "$DATASET_STAGE/LICENSE"
cp "$PROJECT_ROOT/LICENSE" "$ZENODO_STAGE/LICENSE"
cp "$PROJECT_ROOT/docs/DFLY_V1.md" "$DATASET_STAGE/DFLY_V1.md"
cp "$PROJECT_ROOT/docs/DFLY_V1.md" "$ZENODO_STAGE/DFLY_V1.md"
cp "$PROJECT_ROOT/README.md" "$ZENODO_STAGE/README.md"

find "$OUTPUT_ROOT" -type f -printf '%s\t%P\n' | sort -nr > "$OUTPUT_ROOT/ARTIFACTS.tsv"
echo "Release prepared at $OUTPUT_ROOT"
