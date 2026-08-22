#!/usr/bin/env python3
"""Fixture-level contract test for the c302 C. elegans DFLY converter."""

from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path

from openpyxl import Workbook

MODULE_PATH = Path(__file__).with_name("build_celegans_c302_pack.py")
SPEC = importlib.util.spec_from_file_location("celegans_converter", MODULE_PATH)
assert SPEC and SPEC.loader
CONVERTER = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = CONVERTER
SPEC.loader.exec_module(CONVERTER)


class CElegansC302ConverterTests(unittest.TestCase):
    def test_converter_writes_neuron_csr_and_excludes_nmj_rows(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir_string:
            temp_dir = Path(temp_dir_string)
            workbook_path = temp_dir / "NeuronConnectFormatted.xlsx"
            output = temp_dir / "pack"
            workbook = Workbook()
            sheet = workbook.active
            sheet.append(["Neuron 1", "Neuron 2", "Type", "Nbr"])
            sheet.append(["VB01", "AVBR", "S", 4])
            sheet.append(["AVBR", "VB01", "EJ", 2])
            sheet.append(["AVBR", "NMJ", "NMJ", 6])
            workbook.save(workbook_path)
            manifest = CONVERTER.build_pack(
                workbook_path,
                output,
                CONVERTER.InputProvenance("https://example.test/c302", "MIT", ("test citation",)),
                chunk_mib=1,
            )
            self.assertEqual(manifest["neuronCount"], 2)
            self.assertEqual(manifest["synapseCount"], 2)
            self.assertEqual(manifest["dictionaries"]["cellNames"], ["AVBR", "VB1"])
            self.assertEqual(manifest["provenance"]["transform"]["excludedNeuromuscularRows"], 1)
            self.assertEqual(manifest["columns"]["incoming_offsets"]["elementCount"], 3)
            self.assertTrue(all(chunk["sha256"] for chunk in manifest["chunks"]))
            on_disk = json.loads((output / "manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(on_disk["provenance"]["transform"]["name"], "c-elegans-c302-xlsx-to-dfly")
            self.assertTrue((output / on_disk["chunks"][0]["path"]).is_file())


if __name__ == "__main__":
    unittest.main()
