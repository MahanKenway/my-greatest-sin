#!/usr/bin/env python3
"""Rewrite a locally verified DFLY manifest with managed-storage URLs.

This does not alter bytes, checksums, or provenance. It only replaces relative
chunk paths with the exact web-storage URLs returned by manus-upload-file.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


STORAGE_URLS = {
    "incoming_offsets-00000.bin": "/manus-storage/incoming_offsets-00000_ab914822.bin",
    "neuropil_index-00000.bin": "/manus-storage/neuropil_index-00000_eb5d9968.bin",
    "neuropil_index-00001.bin": "/manus-storage/neuropil_index-00001_6d510d5c.bin",
    "root_id-00000.bin": "/manus-storage/root_id-00000_d2558197.bin",
    "source_index-00000.bin": "/manus-storage/source_index-00000_db428c11.bin",
    "source_index-00001.bin": "/manus-storage/source_index-00001_472b52d4.bin",
    "source_index-00002.bin": "/manus-storage/source_index-00002_cbe29da9.bin",
    "synapse_count-00000.bin": "/manus-storage/synapse_count-00000_ff15d272.bin",
    "synapse_count-00001.bin": "/manus-storage/synapse_count-00001_4010fd07.bin",
    "synapse_count-00002.bin": "/manus-storage/synapse_count-00002_c17ba475.bin",
}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    manifest = json.loads(args.input.read_text(encoding="utf-8"))
    for chunk in manifest["chunks"]:
        filename = Path(chunk["path"]).name
        if filename not in STORAGE_URLS:
            raise SystemExit(f"Missing managed-storage URL for {filename}")
        chunk["url"] = STORAGE_URLS[filename]
        del chunk["path"]
    args.output.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
