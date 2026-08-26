#!/usr/bin/env python3
"""Run Brian2CUDA's upstream detection smoke test on an NVIDIA host only."""

from __future__ import annotations

import json
import shutil
import sys


def main() -> int:
    if not shutil.which("nvidia-smi") or not shutil.which("nvcc"):
        print(json.dumps({"state": "BLOCKED", "reason": "NVIDIA driver or nvcc is unavailable; no CPU fallback will run."}))
        return 2
    try:
        import brian2cuda
    except ImportError:
        print(json.dumps({"state": "BLOCKED", "reason": "brian2cuda is not installed in this environment."}))
        return 2
    brian2cuda.example_run()
    print(json.dumps({"state": "PASS", "test": "brian2cuda.example_run", "boundary": "Upstream installation smoke only; not a FlyWire scientific result."}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
