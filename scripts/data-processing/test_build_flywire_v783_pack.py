#!/usr/bin/env python3
"""Fixture-level contract test for the local FlyWire v783 converter."""

from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
import pyarrow as pa
import pyarrow.feather as feather

MODULE_PATH = Path(__file__).with_name("build_flywire_v783_pack.py")
SPEC = importlib.util.spec_from_file_location("dfly_converter", MODULE_PATH)
assert SPEC and SPEC.loader
CONVERTER = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = CONVERTER
SPEC.loader.exec_module(CONVERTER)


class FlyWireV783ConverterTests(unittest.TestCase):
    def test_converter_writes_csr_chunks_and_provenance(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir_string:
            temp_dir = Path(temp_dir_string)
            root_ids = temp_dir / "proofread_root_ids_783.npy"
            connections = temp_dir / "proofread_connections_783.feather"
            output = temp_dir / "pack"
            np.save(root_ids, np.array([101, 202, 303], dtype=np.uint64), allow_pickle=False)
            table = pa.table(
                {
                    "pre_pt_root_id": pa.array([101, 202, 999, 101], type=pa.uint64()),
                    "post_pt_root_id": pa.array([202, 303, 202, 202], type=pa.uint64()),
                    "neuropil": pa.array(["AL_L", "MB_R", "AL_L", "AL_L"]),
                    "syn_count": pa.array([3, 5, 9, 0], type=pa.uint32()),
                    "gaba_avg": pa.array([0.1, 0.2, 0.3, 0.4]),
                    "ach_avg": pa.array([0.2, 0.2, 0.3, 0.4]),
                    "glut_avg": pa.array([0.3, 0.2, 0.3, 0.4]),
                    "oct_avg": pa.array([0.0, 0.0, 0.0, 0.0]),
                    "ser_avg": pa.array([0.0, 0.0, 0.0, 0.0]),
                    "da_avg": pa.array([0.4, 0.4, 0.4, 0.4]),
                }
            )
            feather.write_feather(table, connections)
            manifest = CONVERTER.build_pack(
                root_ids,
                connections,
                output,
                CONVERTER.InputProvenance("https://example.test/v783", "CC BY-NC 4.0", ("test citation",)),
                chunk_mib=1,
            )
            self.assertEqual(manifest["neuronCount"], 3)
            self.assertEqual(manifest["synapseCount"], 2)
            self.assertIn("nt_probabilities", manifest["columns"])
            self.assertEqual(manifest["columns"]["incoming_offsets"]["elementCount"], 4)
            self.assertTrue(all(chunk["sha256"] for chunk in manifest["chunks"]))
            on_disk = json.loads((output / "manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(on_disk["provenance"]["transform"]["name"], "digital-fly-build-v783-pack")
            self.assertTrue((output / on_disk["chunks"][0]["path"]).is_file())


if __name__ == "__main__":
    unittest.main()
