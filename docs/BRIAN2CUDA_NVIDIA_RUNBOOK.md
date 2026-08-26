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

## Colab preparation status — ۲۶ اوت ۲۰۲۶

The pinned notebook was uploaded into the user's Google Drive as `my-greatest-sin-brian2cuda-v783-colab.ipynb` and opened through its Colab URL. The browser was authenticated to the user's Google account. Colab subsequently completed rendering the notebook and exposed its `Runtime` menu and `Connect GPU` control.

The user-requested T4 runtime was selected and connected. The first CUDA-only preflight ran successfully on **Tesla T4** with `NVIDIA-SMI 580.82.07`, driver `580.82.07`, runtime CUDA `13.0`, and `nvcc 12.8.93`. `Brian2Cuda==1.0b1` compiled its upstream example for compute capability `7.5` and printed `Example run was successful` followed by the notebook's `PASS: upstream Brian2CUDA NVIDIA smoke test`. The fresh T4 backend subsequently completed the embedded fixture and the checksum-verified bounded corridor run; the exact report record is given below. This verifies a CUDA-only bounded model path, not a full-FlyWire or biological result.

The three bounded artifacts were subsequently packaged as one embedded ZIP for the active T4 runtime: `run_v783_corridor_brian2cuda.py`, `brian2cuda_corridor_fixture_smoke.py` and the 1,115-node / 13,346-edge corridor. Their current SHA-256 values are respectively `43c255d5c5efcc6ab617cea914c6b4e33fe9e99bc407760e4f96ec1971d91b9f`, `1c8419f39725d3ba1fb8bfa2aec8bd7056a43e5d00d0f8b5f8069775f196f0ce`, and `127dee3d0e1acb11f5eafe2a83424a97f9afdfa1c2716d7c1b1b2dcf5bbac8f5`. A first extraction-cell revision was found to write only the final archive member; it was corrected before any CUDA corridor or fixture run. The corrected notebook file has SHA-256 `1345c2f576ec24a814d3a685dcf1b6c3608b198442754152f8ec06256de2697f`.

In the replacement Tesla T4 backend, the final embedded archive SHA-256 `d14f8b1152fcc6cbeee9781ccdbcd151475fb30b3550b6aa1d05da4a300689e1` and all three member SHA-256 values above were independently verified before writing the files to `/content`. This proves bounded payload integrity; the associated fixture and corridor reports are recorded below and remain explicitly non-biological.

## Runtime recovery status — ۲۶ اوت ۲۰۲۶

After the account reached Colab's concurrent-session limit, the user explicitly terminated the stale GPU session. A fresh backend then connected successfully and reported **Tesla T4**, driver `580.82.07`, NVIDIA-SMI CUDA runtime `13.0`, and `nvcc 12.8.93`. The pinned preflight passed and the CUDA-only fixture and corridor cells completed in this replacement backend. No biological conclusion follows from either run.

## Run record — Tesla T4, 26 August 2026

On the replacement Tesla T4, the upstream Brian2CUDA example compiled for `sm_75` and passed. The embedded archive was validated before extraction, followed by the synthetic numeric fixture and then the actual bounded sugar-GRN → MN9 corridor at **100 Hz**.

| Artifact | Result | Integrity / measured fields |
|---|---|---|
| Synthetic CUDA fixture | `PASS` | Source SHA-256 `372635e2a0de93a2ca6dccad47c3c3649781246924b6ecff6dc08a4242c2054e`; 2 nodes, 1 edge, 1 input, 74 MN9 spikes. |
| Bounded v783 sugar corridor | `CUDA CORRIDOR RUN — MODEL RESULT` | Corridor SHA-256 `127dee3d0e1acb11f5eafe2a83424a97f9afdfa1c2716d7c1b1b2dcf5bbac8f5`; 1,115 nodes, 13,346 edges, 20 retained inputs, 110 MN9 spikes; caps 2,000 nodes / 25,000 edges. |
| `run-report.json` | Written and checksum-recorded | SHA-256 `c95254c4dfbb9fd8310cb2b81611311240c178ed97e4a26adf5b0ff6ff4dcdf1`. |

> The reported 110 spikes are the output of a **server-side bounded model**. They are not a full-FlyWire run, a WebGPU benchmark, animal measurement, behavioural claim, GameWorld activation or FlyBody-control signal. No CUDA ablation result was produced in this record.

## md-C root selection status

The published md-C study identifies roughly two bilateral pairs through a **Tmc-GAL4 ∩ nompC-QF** genetic intersection and demonstrates swallowing relevance, but its article and Dryad bundle provide behaviour/imaging data rather than FlyWire root IDs [2]. The systematic pinned v783 annotation release contains no exact `md-C` label and no pharyngeal/aPhN item marked `cell_class=mechanosensory`. Therefore no exact md-C root list can be selected honestly from the available source data. Broad pharyngeal sensory annotations are not substituted for md-C.

The paper’s reported motor targets are **MN11 and MN12**, not MN9. The pinned v783 annotation TSV likewise contains no exact `MN11` or `MN12` cell-type label. Consequently, an md-C→MN9 corridor would be biologically mis-targeted, while an md-C→MN11/MN12 simulation is blocked pending a published or reproducibly mapped root-ID crosswalk. The sugar/water→MN9 pilot remains a separate feeding/proboscis hypothesis.

## References

[1]: https://brian2cuda.readthedocs.io/en/latest/introduction/install.html "Brian2CUDA installation"

[2]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11616994/ "Qin et al. (2024), Pharyngeal mechanosensory neurons control food swallow"
