#!/usr/bin/env python3
"""Export a reproducible v783 annotation-defined root-ID population.

Input TSVs are kept outside the project; output is a small JSON contract for
structural extraction only. Annotation labels are source data, while any later
Poisson stimulation is a separately labelled modelled input.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(8 * 1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--annotations", type=Path, required=True)
    parser.add_argument("--expected-sha256", required=True)
    parser.add_argument("--annotation-revision", required=True)
    parser.add_argument("--label", required=True)
    parser.add_argument("--where", action="append", required=True, help="Exact TSV filter COLUMN=VALUE; repeatable.")
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    source, output = args.annotations.resolve(), args.out.resolve()
    if PROJECT_ROOT in output.parents:
        raise SystemExit("Output contract must remain outside the repository.")
    actual_sha = sha256(source)
    if actual_sha != args.expected_sha256.lower():
        raise SystemExit(f"Annotation SHA-256 mismatch: {actual_sha}")
    filters: dict[str, str] = {}
    for clause in args.where:
        if "=" not in clause:
            raise SystemExit(f"Invalid --where clause: {clause}")
        key, value = clause.split("=", 1)
        filters[key] = value
    roots: set[str] = set()
    with source.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        missing = set(filters).difference(reader.fieldnames or [])
        if missing or "root_id" not in (reader.fieldnames or []):
            raise SystemExit(f"Missing columns in annotation TSV: {sorted(missing | {'root_id'})}")
        for row in reader:
            if all((row.get(column) or "") == expected for column, expected in filters.items()):
                roots.add(str(row["root_id"]))
    if not roots:
        raise SystemExit("Filters produced no root IDs.")
    try:
        revision = subprocess.check_output(["git", "-C", str(source.parent.parent), "rev-parse", "HEAD"], text=True).strip()
    except Exception:
        revision = args.annotation_revision
    payload = {
        "label": args.label,
        "semanticStatus": "SOURCE DATA — ANNOTATION",
        "release": "783",
        "annotationRepository": "flyconnectome/flywire_annotations",
        "annotationRevision": revision,
        "annotationRelease": args.annotation_revision,
        "annotationTsvSha256": actual_sha,
        "filters": filters,
        "rootIds": sorted(roots),
        "rootCount": len(roots),
        "boundary": "Any later sensory stimulation is MODELLED SENSOR INPUT; this file contains only pinned annotation root IDs.",
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"label": payload["label"], "rootCount": payload["rootCount"], "filters": filters, "annotationRevision": revision}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
