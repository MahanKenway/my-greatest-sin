#!/usr/bin/env bash
# Download the official FlyWire v783 site-level synapse table outside the repository.
# Source: Zenodo 10676866, release 783.0, CC BY 4.0.
set -euo pipefail

DESTINATION="${1:-/home/ubuntu/webdev-static-assets/flywire-v783-source}"
SYNAPSE_URL="https://zenodo.org/api/records/10676866/files/flywire_synapses_783.feather/content"
SYNAPSE_BYTES=9492998242
SYNAPSE_MD5="f8f1b97c9d4b0ea9b4c8b287f6b99091"
PART_COUNT="${PART_COUNT:-16}"

if [[ "$PART_COUNT" -lt 1 || "$PART_COUNT" -gt 64 ]]; then
  echo "PART_COUNT must be between 1 and 64." >&2
  exit 2
fi

mkdir -p "$DESTINATION/.synapses-parts"
cd "$DESTINATION"

download_range() {
  local part="$1"
  local start=$((SYNAPSE_BYTES * part / PART_COUNT))
  local end=$((SYNAPSE_BYTES * (part + 1) / PART_COUNT - 1))
  local destination=".synapses-parts/$(printf '%02d' "$part").part"
  local expected=$((end - start + 1))

  if [[ -f "$destination" && "$(stat --printf='%s' "$destination")" -eq "$expected" ]]; then return; fi
  if [[ -f "$destination" && "$(stat --printf='%s' "$destination")" -gt "$expected" ]]; then rm -f "$destination"; fi
  touch "$destination"
  while [[ "$(stat --printf='%s' "$destination")" -lt "$expected" ]]; do
    local received request_start attempt_file
    received="$(stat --printf='%s' "$destination")"
    request_start=$((start + received))
    attempt_file="${destination}.attempt"
    rm -f "$attempt_file"
    if curl --fail --location --retry 4 --retry-all-errors --retry-delay 2 --range "${request_start}-${end}" --output "$attempt_file" "$SYNAPSE_URL"; then
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

for part in $(seq 0 $((PART_COUNT - 1))); do download_range "$part" & done
wait

cat .synapses-parts/*.part > flywire_synapses_783.feather
[[ "$(stat --printf='%s' flywire_synapses_783.feather)" -eq "$SYNAPSE_BYTES" ]]
printf '%s  %s\n' "$SYNAPSE_MD5" flywire_synapses_783.feather | md5sum --check --status
printf 'Official FlyWire v783 site-level synapse table verified in %s\n' "$DESTINATION"
