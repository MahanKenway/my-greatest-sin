#!/usr/bin/env python3
"""Extract read-only source-evidence for the Shiu et al. sugar-GRN → MN9 pilot.

The script never simulates a body. It verifies root-ID membership and totals only
direct, published-source connection rows in the official v783 Feather table.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pyarrow as pa
import pyarrow.ipc as ipc


SUGAR_GRN_ROOT_IDS = (
    720575940624963786, 720575940630233916, 720575940637568838, 720575940638202345,
    720575940617000768, 720575940630797113, 720575940632889389, 720575940621754367,
    720575940621502051, 720575940640649691, 720575940639332736, 720575940616885538,
    720575940639198653, 720575940620900446, 720575940617937543, 720575940632425919,
    720575940633143833, 720575940612670570, 720575940628853239, 720575940629176663,
    720575940611875570,
)
MN9_ROOT_ID = 720575940660219265


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root-ids", type=Path, required=True)
    parser.add_argument("--connections", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    roots = np.load(args.root_ids, allow_pickle=False).astype(np.uint64, copy=False)
    root_set = {int(value) for value in roots}
    sugar_set = set(SUGAR_GRN_ROOT_IDS)
    present_sugars = sorted(sugar_set & root_set)
    source_outgoing_synapses = {str(root_id): 0 for root_id in SUGAR_GRN_ROOT_IDS}
    direct_sugar_to_mn9 = {str(root_id): 0 for root_id in SUGAR_GRN_ROOT_IDS}
    mn9_incoming_synapses = 0
    mn9_direct_presynaptic_rows = 0

    reader = ipc.open_file(pa.memory_map(str(args.connections), "r"))
    for batch_index in range(reader.num_record_batches):
        batch = reader.get_batch(batch_index)
        names = {name: index for index, name in enumerate(batch.schema.names)}
        pre = batch.column(names["pre_pt_root_id"]).to_numpy(zero_copy_only=False).astype(np.uint64, copy=False)
        post = batch.column(names["post_pt_root_id"]).to_numpy(zero_copy_only=False).astype(np.uint64, copy=False)
        counts = batch.column(names["syn_count"]).to_numpy(zero_copy_only=False).astype(np.uint32, copy=False)
        for pre_id, post_id, count in zip(pre, post, counts, strict=True):
            source_id = int(pre_id)
            target_id = int(post_id)
            weight = int(count)
            if source_id in sugar_set:
                source_outgoing_synapses[str(source_id)] += weight
                if target_id == MN9_ROOT_ID:
                    direct_sugar_to_mn9[str(source_id)] += weight
            if target_id == MN9_ROOT_ID:
                mn9_incoming_synapses += weight
                mn9_direct_presynaptic_rows += 1

    report = {
        "dataset": "FlyWire FAFB proofread connections release 783",
        "sourceStatus": "SOURCE DATA",
        "pilot": "sugar-GRN to MN9",
        "sourceReference": "Shiu et al. (2024), example.ipynb; MN9 root ID and 21 right-labellar sugar-GRN root IDs.",
        "mn9RootId": str(MN9_ROOT_ID),
        "mn9PresentInProofreadRootIds": MN9_ROOT_ID in root_set,
        "sugarGrnRequested": len(SUGAR_GRN_ROOT_IDS),
        "sugarGrnPresent": len(present_sugars),
        "sugarGrnPresentRootIds": [str(root_id) for root_id in present_sugars],
        "directSugarToMn9SynapseTotals": direct_sugar_to_mn9,
        "directSugarToMn9Total": sum(direct_sugar_to_mn9.values()),
        "sugarOutgoingSynapseTotals": source_outgoing_synapses,
        "mn9IncomingSynapseTotal": mn9_incoming_synapses,
        "mn9DirectPresynapticRows": mn9_direct_presynaptic_rows,
        "interpretation": "Direct totals are source connectivity evidence only. A multi-synaptic model, sugar stimulus encoding, and MN9-to-proboscis rendering remain separate MODELLED MAPPING layers.",
    }
    args.output.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
