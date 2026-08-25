#!/usr/bin/env python3
"""Stream-verify every DFLY manifest chunk from a managed-storage manifest URL."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from urllib.parse import urljoin
from urllib.request import urlopen


def fetch_bytes(url: str) -> bytes:
    with urlopen(url, timeout=90) as response:
        return response.read()


def verify(manifest_url: str) -> dict[str, object]:
    manifest = json.loads(fetch_bytes(manifest_url))
    verified_bytes = 0
    for position, chunk in enumerate(manifest["chunks"], start=1):
        url = urljoin(manifest_url, chunk["url"])
        digest = hashlib.sha256()
        size = 0
        with urlopen(url, timeout=180) as response:
            for block in iter(lambda: response.read(8 * 1024 * 1024), b""):
                digest.update(block)
                size += len(block)
        if size != chunk["bytes"]:
            raise ValueError(f"{chunk['id']} size mismatch: expected {chunk['bytes']}, received {size}")
        if digest.hexdigest() != chunk["sha256"]:
            raise ValueError(f"{chunk['id']} SHA-256 mismatch")
        verified_bytes += size
        print(f"[{position}/{len(manifest['chunks'])}] verified {chunk['id']}")
    return {"datasetId": manifest["datasetId"], "release": manifest["release"], "chunks": len(manifest["chunks"]), "verifiedBytes": verified_bytes}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest-url", required=True)
    args = parser.parse_args()
    try:
        print(json.dumps(verify(args.manifest_url), indent=2))
    except Exception as error:
        raise SystemExit(f"Managed manifest verification failed: {error}") from error
    return 0


if __name__ == "__main__":
    sys.exit(main())
