"""Compile and run a tiny signed numerical fixture on Brian2CUDA only.

This validates the bounded-corridor code path and output report, not FlyWire,
md-C, MN9 biology, or FlyBody control. It refuses CPU fallback.
"""

from __future__ import annotations

import json
import tempfile
from pathlib import Path

from run_v783_corridor_brian2cuda import preflight, run, sha256


FIXTURE = {
    "release": "783",
    "lifGate": {"state": "READY FOR SUBGRAPH"},
    "nodes": [
        {"rootId": "fixture-input", "neuronSign": 1},
        {"rootId": "fixture-output", "neuronSign": 1},
    ],
    "edges": [{"source": "fixture-input", "target": "fixture-output", "synapseCount": 1000}],
    "inputRootIds": ["fixture-input"],
    "mn9RootId": "fixture-output",
    "boundary": "Synthetic numeric fixture only; not FlyWire or a biological result.",
}


def main() -> int:
    status = preflight()
    if status["state"] != "READY":
        print(json.dumps({"state": "BLOCKED", "reason": "CUDA/Brian2CUDA preflight failed; no CPU fixture will run.", "preflight": status}, sort_keys=True))
        return 2
    with tempfile.TemporaryDirectory(prefix="my-greatest-sin-cuda-fixture-") as temporary:
        root = Path(temporary)
        corridor = root / "fixture-corridor.json"
        corridor.write_text(json.dumps(FIXTURE, sort_keys=True), encoding="utf-8")
        run(corridor, root / "build", 100.0, sha256(corridor))
        report = json.loads((root / "build" / "run-report.json").read_text(encoding="utf-8"))
        print(json.dumps({"state": "PASS", "test": "bounded CUDA numerical fixture", "report": report, "boundary": FIXTURE["boundary"]}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
