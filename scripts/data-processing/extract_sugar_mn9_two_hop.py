#!/usr/bin/env python3
"""Find direct two-hop sugar-GRN → intermediate → MN9 paths in official v783 data.

This source-evidence utility never assigns physiology, stimulus rates, or body motion.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import pyarrow as pa
import pyarrow.ipc as ipc

from extract_sugar_mn9_pilot import MN9_ROOT_ID, SUGAR_GRN_ROOT_IDS


def batches(path: Path):
    reader = ipc.open_file(pa.memory_map(str(path), "r"))
    for index in range(reader.num_record_batches):
        batch = reader.get_batch(index)
        names = {name: column for column, name in enumerate(batch.schema.names)}
        yield (
            batch.column(names["pre_pt_root_id"]).to_pylist(),
            batch.column(names["post_pt_root_id"]).to_pylist(),
            batch.column(names["syn_count"]).to_pylist(),
        )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--connections", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    sugar = set(SUGAR_GRN_ROOT_IDS)
    sugar_targets: set[int] = set()
    mn9_presynaptic: set[int] = set()
    for pre_ids, post_ids, counts in batches(args.connections):
        for pre, post, count in zip(pre_ids, post_ids, counts, strict=True):
            if not count:
                continue
            pre_id, post_id = int(pre), int(post)
            if pre_id in sugar:
                sugar_targets.add(post_id)
            if post_id == MN9_ROOT_ID:
                mn9_presynaptic.add(pre_id)

    intermediates = sugar_targets & mn9_presynaptic
    paths: dict[int, dict[str, object]] = {
        intermediate: {"intermediateRootId": str(intermediate), "sugarToIntermediate": {}, "intermediateToMn9": 0}
        for intermediate in intermediates
    }
    for pre_ids, post_ids, counts in batches(args.connections):
        for pre, post, count in zip(pre_ids, post_ids, counts, strict=True):
            if not count:
                continue
            pre_id, post_id, weight = int(pre), int(post), int(count)
            if pre_id in sugar and post_id in paths:
                current = paths[post_id]["sugarToIntermediate"]
                assert isinstance(current, dict)
                current[str(pre_id)] = weight
            if pre_id in paths and post_id == MN9_ROOT_ID:
                paths[pre_id]["intermediateToMn9"] = weight

    ordered_paths = sorted(paths.values(), key=lambda item: int(item["intermediateToMn9"]), reverse=True)
    report = {
        "dataset": "FlyWire FAFB proofread connections release 783",
        "sourceStatus": "SOURCE DATA",
        "query": "two-hop published sugar-GRN roots to published MN9 root",
        "sugarGrnRootCount": len(SUGAR_GRN_ROOT_IDS),
        "mn9RootId": str(MN9_ROOT_ID),
        "twoHopIntermediateCount": len(ordered_paths),
        "twoHopPaths": ordered_paths,
        "interpretation": "Rows are structural source connectivity. Intermediates have not been assigned causal sensory-motor function; stimulus encoding and MN9/proboscis mapping remain MODELLED MAPPING.",
    }
    args.output.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
