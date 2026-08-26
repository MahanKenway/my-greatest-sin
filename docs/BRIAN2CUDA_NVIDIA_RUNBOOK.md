# Brian2CUDA NVIDIA Runbook

## Purpose

This runbook executes the already bounded, checksum-verified v783 corridor through the Brian2CUDA backend. It does **not** activate `GameWorld`, change `0 N / 0 E`, benchmark WebGPU, or send a result to FlyBody.

## Host requirements

The official Brian2CUDA installation guidance requires Linux, an NVIDIA CUDA GPU, a CUDA Toolkit with `nvcc`, and a Brian2 version compatible with the installed Brian2CUDA release [1]. The current reproducible top-level environment uses `Brian2Cuda==1.0b1`; its installer resolves the matching Brian2 version. The main sandbox is correctly blocked because `nvidia-smi`, `nvcc`, Brian2 and Brian2CUDA are absent.

The reproducible assets are `requirements-brian2cuda-nvidia.txt`, `brian2cuda_upstream_smoke.py`, `brian2cuda_corridor_fixture_smoke.py`, `run_brian2cuda_nvidia_protocol.sh` and the Colab notebook. The fixture performs a compile/run only on a tiny synthetic signed graph after the upstream smoke; it proves CUDA-path integrity, not FlyWire or MN9 biology. The real runner accepts only signed v783 corridors up to **2,000 nodes / 25,000 edges**, validates a supplied expected SHA-256 when present and rejects rates outside 0–200 Hz. The smoke script returned the expected `BLOCKED` state in this sandbox before any model code ran, because the NVIDIA driver and `nvcc` are absent. This is an installation/hardware result only, not an MN9 or LIF measurement.

## Colab route

Open `scripts/data-processing/brian2cuda_v783_colab.ipynb` in Colab, choose an NVIDIA GPU runtime, run the upstream smoke cell, then upload:

1. `run_v783_corridor_brian2cuda.py` and `brian2cuda_corridor_fixture_smoke.py` from this repository; and
2. one signed corridor JSON generated outside the repository.

The final cell requires an explicit uploaded filename and a 64-character expected corridor SHA-256, validates it before model code, runs the synthetic CUDA fixture, then runs the CUDA-only prototype at 100 Hz and writes `/content/v783-cuda-build/run-report.json`. If `nvidia-smi`, `nvcc`, the upstream test, fixture, checksum, sign completeness or corridor gate fails, stop and record `BLOCKED`; do not change the script to run a CPU replacement.

## md-C root selection status

The published md-C study identifies roughly two bilateral pairs through a **Tmc-GAL4 ∩ nompC-QF** genetic intersection and demonstrates swallowing relevance, but its article and Dryad bundle provide behaviour/imaging data rather than FlyWire root IDs [2]. The systematic pinned v783 annotation release contains no exact `md-C` label and no pharyngeal/aPhN item marked `cell_class=mechanosensory`. Therefore no exact md-C root list can be selected honestly from the available source data. Broad pharyngeal sensory annotations are not substituted for md-C.

The paper’s reported motor targets are **MN11 and MN12**, not MN9. The pinned v783 annotation TSV likewise contains no exact `MN11` or `MN12` cell-type label. Consequently, an md-C→MN9 corridor would be biologically mis-targeted, while an md-C→MN11/MN12 simulation is blocked pending a published or reproducibly mapped root-ID crosswalk. The sugar/water→MN9 pilot remains a separate feeding/proboscis hypothesis.

## References

[1]: https://brian2cuda.readthedocs.io/en/latest/introduction/install.html "Brian2CUDA installation"

[2]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11616994/ "Qin et al. (2024), Pharyngeal mechanosensory neurons control food swallow"
