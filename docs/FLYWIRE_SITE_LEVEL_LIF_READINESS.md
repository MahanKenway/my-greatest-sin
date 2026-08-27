# FlyWire v783 Site-Level Sign/Weight LIF Readiness

**Status at 27 August 2026:** **BLOCKED before WebGPU dispatch.** The block is scientific-data completeness, not a synthetic fallback or a browser crash.

## Verified inputs

| Artifact | Location | Verified property | Status |
|---|---|---|---|
| Official site-level synapse source | Zenodo record 10676866 | `flywire_synapses_783.feather`, 9,492,998,242 bytes; recorded MD5 `f8f1b97c9d4b0ea9b4c8b287f6b99091` | Present outside repository |
| Site-level sign derivative | `flywire-v783-neuron-sign-v1` | DFLY-NEURON-SIGN / release 783; cutoff 50; strict-majority inhibitory rule | Checksum manifest present |
| LIF candidate CSR | `flywire-v783-dfly-lif-candidate-v1` | 139,255 proofread roots; 16,847,997 connection rows; CSR and six neurotransmitter-probability columns | Checksum manifest present |

Zenodo documents that the site-level table has approximately 130 million synapses, provides `cleft_score`, and releases rows only above its cleft-score threshold of 50. It also includes six site-level neurotransmitter probabilities. The Shiu model uses a cleft-score cutoff of 50 and assigns a neuron-level transmitter from its qualifying presynaptic sites. [1] [2]

## Sign gate result

The locally verified release-783 derivative reports **94,640 excitatory**, **44,011 inhibitory**, and **604 unclassified** proofread neurons. The active contract requires every proofread source neuron to have a resolved sign. Therefore, `assertLifSignManifestReady` blocks signed-LIF dispatch before device allocation. Treating the 604 open signs as excitatory, inhibitory, zero, or an average is not allowed.

## WebGPU and UI readiness

The new public panel exposes only two clearly labelled **MODELLED** values: synaptic weight (default 0.275 mV, adjustable 0.05–0.50 mV) and Poisson input scale (default 250, adjustable 0–500). They remain settings for a future signed-LIF experiment and do not control FlyBody, walking, wings, GameWorld, or a hidden CPU implementation.

The sign-aware preflight calculated a largest binding of **64.3 MiB** and an estimated resident footprint of **132.3 MiB** before spike-history allocation. It retains summary counters and bounded charts only; the public interface does not render 139,255 rows or 16,847,997 edges. No signed-LIF shader dispatch occurs until both the sign gate and `requestAdapter()`/storage-buffer gate pass. In the current browser, the recorded WebGPU adapter request remains rejected.

## Next scientific gate

The only route forward is to reproduce or obtain an aligned sign derivative that resolves the 604 proofread roots under the same release-783 identifiers and recorded site-level rule, then checksum it and re-run the gate on a browser with a real WebGPU adapter. This must happen before the existing WGSL LIF kernel is dispatched against the full graph.

## References

[1]: https://zenodo.org/records/10676866 "FlyWire Whole-brain Connectome Connectivity Data, release 783"

[2]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11446845/ "A Drosophila computational brain model reveals sensorimotor processing"
