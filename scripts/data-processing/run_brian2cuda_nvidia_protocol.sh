#!/usr/bin/env bash
# Runs only on a Linux NVIDIA host. It refuses to substitute CPU execution.
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VENV_DIR="${VENV_DIR:-$HOME/.venvs/my-greatest-sin-brian2cuda}"
CORRIDOR_PATH="${1:?Pass a checksum-verified v783 corridor JSON path}"
BUILD_DIR="${2:?Pass an external writable CUDA build directory}"
RATE_HZ="${RATE_HZ:-100}"

command -v nvidia-smi >/dev/null || { echo "BLOCKED: nvidia-smi unavailable" >&2; exit 2; }
command -v nvcc >/dev/null || { echo "BLOCKED: nvcc unavailable" >&2; exit 2; }
python3 -m venv "$VENV_DIR"
"$VENV_DIR/bin/python" -m pip install --upgrade pip
"$VENV_DIR/bin/python" -m pip install -r "$PROJECT_ROOT/scripts/data-processing/requirements-brian2cuda-nvidia.txt"
"$VENV_DIR/bin/python" "$PROJECT_ROOT/scripts/data-processing/brian2cuda_upstream_smoke.py"
"$VENV_DIR/bin/python" "$PROJECT_ROOT/scripts/data-processing/brian2cuda_corridor_fixture_smoke.py"
"$VENV_DIR/bin/python" "$PROJECT_ROOT/scripts/data-processing/run_v783_corridor_brian2cuda.py" --corridor "$CORRIDOR_PATH" --build-dir "$BUILD_DIR" --rate-hz "$RATE_HZ"
