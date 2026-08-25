#!/usr/bin/env bash
# Download only the two Zenodo v783 files required by the DFLY pack builder.
# Source: Zenodo record 10676866, version 783.0, CC BY 4.0.
set -euo pipefail

DESTINATION="${1:-/home/ubuntu/webdev-static-assets/flywire-v783-source}"
CONNECTIONS_URL="https://zenodo.org/api/records/10676866/files/proofread_connections_783.feather/content"
ROOT_IDS_URL="https://zenodo.org/api/records/10676866/files/proofread_root_ids_783.npy/content"
CONNECTIONS_BYTES=852022274
CONNECTIONS_MD5="f48f972d262323a102aed49af1396b8a"
ROOT_IDS_MD5="e0e6c19732fd8c7a4e39a2d170105421"
PART_COUNT=8

mkdir -p "$DESTINATION/.connections-parts"
cd "$DESTINATION"

download_range() {
  local part="$1"
  local start=$((CONNECTIONS_BYTES * part / PART_COUNT))
  local end=$((CONNECTIONS_BYTES * (part + 1) / PART_COUNT - 1))
  local destination=".connections-parts/$(printf '%02d' "$part").part"
  local expected=$((end - start + 1))

  if [[ -f "$destination" && "$(stat --printf='%s' "$destination")" -eq "$expected" ]]; then
    return
  fi

  if [[ -f "$destination" && "$(stat --printf='%s' "$destination")" -gt "$expected" ]]; then
    rm -f "$destination"
  fi
  touch "$destination"
  while [[ "$(stat --printf='%s' "$destination")" -lt "$expected" ]]; do
    local received
    local request_start
    local attempt_file
    received="$(stat --printf='%s' "$destination")"
    request_start=$((start + received))
    attempt_file="${destination}.attempt"
    rm -f "$attempt_file"
    if curl --fail --location --retry 4 --retry-all-errors --retry-delay 2 \
      --range "${request_start}-${end}" --output "$attempt_file" "$CONNECTIONS_URL"; then
      cat "$attempt_file" >> "$destination"
    elif [[ -s "$attempt_file" ]]; then
      cat "$attempt_file" >> "$destination"
    else
      sleep 2
    fi
    rm -f "$attempt_file"
  done
  [[ "$(stat --printf='%s' "$destination")" -eq "$expected" ]]
}

curl --fail --location --retry 8 --retry-all-errors --retry-delay 2 \
  --output proofread_root_ids_783.npy "$ROOT_IDS_URL"
printf '%s  %s\n' "$ROOT_IDS_MD5" proofread_root_ids_783.npy | md5sum --check --status

for part in $(seq 0 $((PART_COUNT - 1))); do
  download_range "$part" &
done
wait

cat .connections-parts/*.part > proofread_connections_783.feather
[[ "$(stat --printf='%s' proofread_connections_783.feather)" -eq "$CONNECTIONS_BYTES" ]]
printf '%s  %s\n' "$CONNECTIONS_MD5" proofread_connections_783.feather | md5sum --check --status
printf 'Official FlyWire v783 inputs verified in %s\n' "$DESTINATION"
