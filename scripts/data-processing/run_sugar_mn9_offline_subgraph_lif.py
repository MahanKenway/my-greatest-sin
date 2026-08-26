#!/usr/bin/env python3
"""Run a bounded offline LIF validation on the signed sugar-GRN -> MN9 subgraph.

This is intentionally not a CPU fallback for full FlyWire: it accepts only the
small extracted structural subgraph and writes OFFLINE SUBGRAPH VALIDATION
results. It never imports web app code, updates GameWorld, or drives FlyBody.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import shutil
import sys
from collections import defaultdict
from pathlib import Path
from statistics import mean, pstdev
from typing import Any

import numpy as np


PROJECT_ROOT = Path(__file__).resolve().parents[2]
RATES_HZ = (0, 25, 50, 100, 150, 200)
PARAMS = {
    "durationMs": 1000.0,
    "trials": 30,
    "dtMs": 0.1,
    "restingMilliVolts": -52.0,
    "resetMilliVolts": -52.0,
    "thresholdMilliVolts": -45.0,
    "membraneTimeConstantMs": 20.0,
    "synapseDecayMs": 5.0,
    "refractoryMs": 2.2,
    "synapticDelayMs": 1.8,
    "synapticWeightMilliVolts": 0.275,
    "poissonInputScale": 250.0,
    "seed": 7832026,
}


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(8 * 1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def inside(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def load_subgraph(path: Path) -> tuple[dict[str, Any], dict[str, int], np.ndarray, np.ndarray, np.ndarray, list[int], int]:
    graph = json.loads(path.read_text(encoding="utf-8"))
    gate = graph.get("lifGate", {})
    if gate.get("state") != "READY FOR SUBGRAPH":
        raise ValueError(f"Subgraph LIF gate is not ready: {gate.get('reason', 'unknown reason')}")
    nodes = graph["nodes"]
    roots = [str(node["rootId"]) for node in nodes]
    index = {root: offset for offset, root in enumerate(roots)}
    signs = np.array([int(node["neuronSign"]) for node in nodes], dtype=np.int32)
    if np.any(signs == 0):
        raise ValueError("Subgraph contains unclassified source signs.")
    source = np.array([index[str(edge["source"])] for edge in graph["edges"]], dtype=np.int32)
    target = np.array([index[str(edge["target"])] for edge in graph["edges"]], dtype=np.int32)
    counts = np.array([int(edge["synapseCount"]) for edge in graph["edges"]], dtype=np.float32)
    weights = counts * signs[source].astype(np.float32) * PARAMS["synapticWeightMilliVolts"]
    sugar = sorted({index[str(edge["source"])] for edge in graph["edges"] if edge["edgeRole"] == "sugar_to_intermediate"})
    mn9 = index[str(graph["mn9RootId"])]
    return graph, index, source, target, weights, sugar, mn9


def run_trial(node_count: int, source: np.ndarray, target: np.ndarray, weights: np.ndarray, sugar: list[int], mn9_index: int, rate_hz: int, ablated: bool, trial_seed: int) -> int:
    p = PARAMS
    rng = np.random.default_rng(trial_seed)
    step_count = int(round(p["durationMs"] / p["dtMs"]))
    delay_steps = max(1, int(round(p["synapticDelayMs"] / p["dtMs"])))
    history = np.zeros((delay_steps + 1, node_count), dtype=np.bool_)
    membrane = np.full(node_count, p["restingMilliVolts"], dtype=np.float32)
    conductance = np.zeros(node_count, dtype=np.float32)
    refractory = np.zeros(node_count, dtype=np.float32)
    decay = math.exp(-p["dtMs"] / p["synapseDecayMs"])
    poisson_probability = 0.0 if ablated else rate_hz * p["dtMs"] / 1000.0
    poisson_weight = p["synapticWeightMilliVolts"] * p["poissonInputScale"]
    mn9_spikes = 0
    slot = 0
    sugar_indices = np.asarray(sugar, dtype=np.int32)
    for _ in range(step_count):
        delayed = history[slot].copy()
        history[slot].fill(False)
        conductance *= decay
        active_edges = delayed[source]
        if np.any(active_edges):
            np.add.at(conductance, target[active_edges], weights[active_edges])
        eligible = refractory <= 0.0
        membrane[eligible] += (p["restingMilliVolts"] - membrane[eligible] + conductance[eligible]) * (p["dtMs"] / p["membraneTimeConstantMs"])
        if poisson_probability and sugar_indices.size:
            poisson_hits = sugar_indices[rng.random(sugar_indices.size) < poisson_probability]
            membrane[poisson_hits] += poisson_weight
        spikes = eligible & (membrane > p["thresholdMilliVolts"])
        # Brian2 reference removes refractory from Poisson-input target neurons.
        if sugar_indices.size:
            spikes[sugar_indices] = membrane[sugar_indices] > p["thresholdMilliVolts"]
        if spikes[mn9_index]:
            mn9_spikes += 1
        membrane[spikes] = p["resetMilliVolts"]
        conductance[spikes] = 0.0
        refractory[spikes] = p["refractoryMs"]
        refractory[sugar_indices] = 0.0
        refractory[~spikes] = np.maximum(0.0, refractory[~spikes] - p["dtMs"])
        write_slot = (slot + delay_steps) % history.shape[0]
        history[write_slot] = spikes
        slot = (slot + 1) % history.shape[0]
    return mn9_spikes


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--subgraph", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    args = parser.parse_args()
    subgraph_path, out_dir = args.subgraph.resolve(), args.out_dir.resolve()
    if inside(out_dir, PROJECT_ROOT):
        raise SystemExit("Offline result output must remain outside the repository.")
    if out_dir.exists() and any(out_dir.iterdir()):
        raise SystemExit(f"Output directory must be empty: {out_dir}")
    graph, index, source, target, weights, sugar, mn9 = load_subgraph(subgraph_path)
    out_dir.mkdir(parents=True, exist_ok=True)
    # SYNTHETIC TEST FIXTURE only: this direct strong edge checks numerical propagation.
    # It is never a FlyWire result and is recorded separately from source-derived runs.
    sanity_spikes = run_trial(
        2,
        np.array([0], dtype=np.int32),
        np.array([1], dtype=np.int32),
        np.array([1000 * PARAMS["synapticWeightMilliVolts"]], dtype=np.float32),
        [0],
        1,
        200,
        False,
        PARAMS["seed"],
    )
    if sanity_spikes <= 0:
        raise RuntimeError("SYNTHETIC TEST FIXTURE failed: the LIF propagation kernel did not activate a direct strong edge.")
    rows: list[dict[str, object]] = []
    for condition, ablated in (("baseline", False), ("input-ablation", True)):
        for rate in RATES_HZ:
            for trial in range(PARAMS["trials"]):
                seed = PARAMS["seed"] + (100000 if ablated else 0) + rate * 100 + trial
                spikes = run_trial(len(index), source, target, weights, sugar, mn9, rate, ablated, seed)
                rows.append({"status": "OFFLINE SUBGRAPH VALIDATION", "condition": condition, "requested_rate_hz": rate, "effective_rate_hz": 0 if ablated else rate, "trial": trial, "seed": seed, "mn9_spikes": spikes, "mn9_rate_hz": spikes / (PARAMS["durationMs"] / 1000.0)})
    with (out_dir / "raw-mn9-trials.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    groups: dict[tuple[str, int], list[float]] = defaultdict(list)
    for row in rows:
        groups[(str(row["condition"]), int(row["requested_rate_hz"]))].append(float(row["mn9_rate_hz"]))
    summary = [{"condition": condition, "requestedRateHz": rate, "meanMn9RateHz": mean(values), "populationStdMn9RateHz": pstdev(values), "trialCount": len(values)} for (condition, rate), values in sorted(groups.items())]
    report = {
        "status": "OFFLINE SUBGRAPH VALIDATION — NOT FULL FLYWIRE EXECUTION OR WEBGPU BENCHMARK",
        "scope": {"nodeCount": len(index), "edgeCount": int(source.size), "stimulatedSugarRootsInObservedPaths": len(sugar), "mn9RootId": graph["mn9RootId"]},
        "parameters": PARAMS,
        "numericalMethod": "Forward-Euler approximation of the documented alpha-synapse LIF equations; not yet an equivalence validation against Brian2 linear integration.",
        "sourceArtifacts": {"signedSubgraph": str(subgraph_path), "signedSubgraphSha256": sha256_file(subgraph_path)},
        "kernelSanity": {"status": "SYNTHETIC TEST FIXTURE — NOT FLYWIRE RESULT", "directStrongEdgeSynapseCount": 1000, "inputRateHz": 200, "mn9Spikes": sanity_spikes},
        "results": summary,
        "boundaries": ["No full 139,255-neuron CPU fallback was executed.", "No GameWorld count, WebGPU benchmark, or FlyBody output was changed.", "Input ablation closes modelled external sugar injection only."],
    }
    (out_dir / "summary.json").write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps({"summary": str(out_dir / "summary.json"), "rawTrials": str(out_dir / "raw-mn9-trials.csv"), "scope": report["scope"], "results": summary}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
