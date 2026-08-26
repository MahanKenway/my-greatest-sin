#!/usr/bin/env python3
"""Run a verified v783 corridor with Brian2CUDA only when CUDA is available.

This is a server-side prototype for an *already bounded* corridor. It never
falls back to CPU and never changes the browser GameWorld or FlyBody. The
equations and constants follow philshiu/Drosophila_brain_model/model.py.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import shutil
import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
V0_MV, VRESET_MV, VTH_MV, TM_MS, TAU_MS, REFRACTORY_MS, DELAY_MS, WSYN_MV, POISSON_SCALE = (-52.0, -52.0, -45.0, 20.0, 5.0, 2.2, 1.8, 0.275, 250)
MAX_NODES, MAX_EDGES = 2_000, 25_000


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(8 * 1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def preflight() -> dict[str, object]:
    command = ["nvidia-smi", "--query-gpu=name,driver_version,memory.total", "--format=csv,noheader"]
    gpu = None
    if shutil.which("nvidia-smi"):
        completed = subprocess.run(command, capture_output=True, text=True, check=False)
        gpu = completed.stdout.strip() if completed.returncode == 0 else None
    return {
        "state": "READY" if gpu and shutil.which("nvcc") and importlib.util.find_spec("brian2") and importlib.util.find_spec("brian2cuda") else "BLOCKED",
        "cudaCompiler": shutil.which("nvcc"),
        "nvidiaSmi": gpu,
        "brian2Installed": bool(importlib.util.find_spec("brian2")),
        "brian2cudaInstalled": bool(importlib.util.find_spec("brian2cuda")),
        "boundary": "No CPU fallback is permitted. READY only checks prerequisites; it does not validate a scientific result.",
    }


def require_output_outside_project(path: Path) -> None:
    try:
        path.resolve().relative_to(PROJECT_ROOT)
    except ValueError:
        return
    raise SystemExit("CUDA build output must remain outside the repository.")


def run(corridor_path: Path, build_dir: Path, rate_hz: float, expected_corridor_sha256: str | None = None) -> None:
    status = preflight()
    if status["state"] != "READY":
        raise SystemExit("CUDA PRE-FLIGHT BLOCKED: " + json.dumps(status, sort_keys=True))
    require_output_outside_project(build_dir)
    if not 0 <= rate_hz <= 200:
        raise SystemExit("rate-hz must be within the registered 0–200 Hz protocol.")
    corridor_sha256 = sha256(corridor_path)
    if expected_corridor_sha256 and corridor_sha256 != expected_corridor_sha256.lower():
        raise SystemExit("Corridor SHA-256 does not match --expected-corridor-sha256.")
    graph = json.loads(corridor_path.read_text(encoding="utf-8"))
    if graph.get("release") != "783" or graph.get("lifGate", {}).get("state") != "READY FOR SUBGRAPH":
        raise SystemExit("Corridor must be a sign-complete v783 artifact.")
    nodes = graph["nodes"]
    edges = graph["edges"]
    if not isinstance(nodes, list) or not isinstance(edges, list) or not 1 <= len(nodes) <= MAX_NODES or not 1 <= len(edges) <= MAX_EDGES:
        raise SystemExit(f"CUDA prototype accepts only bounded corridors up to {MAX_NODES} nodes / {MAX_EDGES} edges.")
    index = {str(node["rootId"]): position for position, node in enumerate(nodes)}
    if len(index) != len(nodes):
        raise SystemExit("Corridor root IDs must be unique.")
    signs = [int(node["neuronSign"]) for node in nodes]
    if not all(sign in (-1, 1) for sign in signs):
        raise SystemExit("Unclassified node signs are forbidden in the CUDA prototype.")
    sources, targets, weights = [], [], []
    for edge in edges:
        source, target = index[str(edge["source"])], index[str(edge["target"])]
        sources.append(source)
        targets.append(target)
        weights.append(signs[source] * int(edge["synapseCount"]))
    inputs = [index[root] for root in graph["inputRootIds"] if root in index]
    mn9_index = index[str(graph["mn9RootId"])]
    if not inputs:
        raise SystemExit("No annotated inputs remain in the retained corridor.")
    from brian2 import Hz, Network, NeuronGroup, PoissonInput, SpikeMonitor, Synapses, ms, mV, second, set_device
    import brian2cuda  # noqa: F401; required for the CUDA standalone device

    set_device("cuda_standalone", build_on_run=False)
    params = {"v_0": V0_MV * mV, "v_rst": VRESET_MV * mV, "v_th": VTH_MV * mV, "t_mbr": TM_MS * ms, "tau": TAU_MS * ms, "t_rfc": REFRACTORY_MS * ms, "t_dly": DELAY_MS * ms, "w_syn": WSYN_MV * mV}
    equation = "dv/dt = (v_0 - v + g) / t_mbr : volt (unless refractory)\ndg/dt = -g / tau : volt (unless refractory)\nrfc : second"
    neurons = NeuronGroup(len(nodes), equation, method="linear", threshold="v > v_th", reset="v = v_rst; g = 0*mV", refractory="rfc", namespace=params, name="v783_corridor_neurons")
    neurons.v, neurons.g, neurons.rfc = params["v_0"], 0 * mV, params["t_rfc"]
    synapses = Synapses(neurons, neurons, "w : volt", on_pre="g += w", delay=params["t_dly"], name="v783_corridor_synapses")
    synapses.connect(i=sources, j=targets)
    synapses.w = [weight * params["w_syn"] for weight in weights]
    poisson = [PoissonInput(neurons[index], "v", N=1, rate=rate_hz * Hz, weight=params["w_syn"] * POISSON_SCALE) for index in inputs]
    for index in inputs:
        neurons[index].rfc = 0 * ms
    monitor = SpikeMonitor(neurons[mn9_index])
    network = Network(neurons, synapses, monitor, *poisson)
    network.run(1000 * ms)
    build_dir.mkdir(parents=True, exist_ok=True)
    from brian2 import device
    device.build(directory=str(build_dir), compile=True, run=True, clean=True)
    report = {"status": "CUDA CORRIDOR RUN — MODEL RESULT", "corridorSha256": corridor_sha256, "rateHz": rate_hz, "inputCount": len(inputs), "nodeCount": len(nodes), "edgeCount": len(sources), "mn9Spikes": int(len(monitor.t)), "caps": {"maxNodes": MAX_NODES, "maxEdges": MAX_EDGES}, "boundary": "This is a server-side bounded corridor result, not full FlyWire or FlyBody control."}
    (build_dir / "run-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--preflight", action="store_true")
    parser.add_argument("--corridor", type=Path)
    parser.add_argument("--build-dir", type=Path)
    parser.add_argument("--rate-hz", type=float, default=100.0)
    parser.add_argument("--expected-corridor-sha256", type=str)
    args = parser.parse_args()
    if args.preflight:
        print(json.dumps(preflight(), indent=2))
        return 0
    if not args.corridor or not args.build_dir:
        parser.error("--corridor and --build-dir are required unless --preflight is used.")
    run(args.corridor.resolve(), args.build_dir.resolve(), args.rate_hz, args.expected_corridor_sha256)
    return 0


if __name__ == "__main__":
    sys.exit(main())
