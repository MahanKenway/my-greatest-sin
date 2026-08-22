# Scientific Limitations

Digital Fly is research software for exploring a proposed computational and embodied use of connectomic structure. It is **not** a living organism, a claim of consciousness, or an experimentally validated model of a complete fly’s cognition or behavior.

The FlyWire release is a structural wiring dataset with annotations and predictions, not a complete specification of every neuron’s intrinsic biophysics, receptor dynamics, developmental state, synaptic delay, sensory transduction, muscle mechanics, or behavioral context. A leaky-integrate-and-fire implementation is a modelling choice. It can be useful for scalable experiments, but it does not turn the structural graph into a complete biological simulation.

The browser body, environmental field models, sensory encoders, motor decoder, gait controller, and any plasticity rule are likewise modelled components. Their outputs must be labelled `MODELLED MAPPING` unless a specific cited curation and validation protocol supports a narrower claim. Demonstration behavior shows that this software’s loop runs, not that the source animal would behave the same way.

The base build includes a deterministic synthetic fixture to test binary loading, neural updates, signal routing, and embodied feedback. This fixture has no biological identity and must never be reported as FlyWire data or used to infer scientific results. A full validated release run requires the user to obtain compatible data under the applicable data-use terms and to inspect the loader’s provenance report.

The current implementation target also does not establish real-time full-graph performance on all browsers. GPU limits, memory budgets, precision, hardware drivers, and browser security policy vary. The program reports its selected backend and unsupported conditions rather than silently degrading a claimed full-connectome execution.
