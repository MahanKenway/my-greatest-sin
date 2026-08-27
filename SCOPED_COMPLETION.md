# Scoped Completion Record

## Meaning of “100%” in this release

This record defines **completion of the current product scope**, not completion of a biologically faithful organism or full FlyWire brain. The public product is complete when the published static application is independently loadable, its assets resolve without a preview host, its primary controls are keyboard reachable, reduced-motion is honoured, and both species disclose their different execution states.

The C. elegans scope is complete when the immutable, checksum-verified 279-neuron / 6,261-edge source topology hydrates in production; field encoding, log-compressed conductance mapping, DB/VB grouping, motor decoder, body scale and smoothing remain visibly disclosed as modelled mappings; a zero decoder output produces no new body motion; and an explicitly labelled **decoder-readout intervention** can demonstrate the causal role of DB or VB in the display mapping. This intervention is not a biological lesion, a neural ablation experiment, or evidence of behaviour in a living worm.

## Public-product acceptance matrix

| Criterion | Evidence required | Status |
|---|---|---|
| Standalone public delivery | Cloudflare Pages production URL loads without the managed preview origin | Passed: `my-greatest-sin.pages.dev` |
| Asset integrity | Garden, two specimen GLBs, sky textures and five C. elegans source chunks resolve from published relative paths | Passed in production |
| Species honesty | FlyWire remains 0 N / 0 E / display-only; C. elegans remains 279 N / 6,261 E / source active | Passed in production |
| Operability | Native controls and documented keyboard shortcuts work without intercepting form inputs | Passed: five commands have native and keyboard paths |
| Motion accessibility | `prefers-reduced-motion` suppresses non-essential cosmetic motion | Passed: stylesheet audit and mobile capture |
| Regression safety | TypeScript, deterministic tests, production build, console review and mobile/desktop capture pass | Passed: 35 tests; production console clean |

## C. elegans acceptance matrix

| Criterion | Evidence required | Status |
|---|---|---|
| Source topology | Manifest plus five checksummed chunks hydrate to 279 N / 6,261 E | Passed in production |
| Network-first body path | `neural.step` → source DB/VB activity → disclosed decoder → `MotorFrame` → body | Passed: browser path inspected |
| Zero-command safety | No new gait, translation or turn is introduced when decoder output is zero | Passed: deterministic regression |
| Live observability | DB/VB 48-sample timeline and instant values are rendered from runtime activity | Passed in production |
| Controlled causal check | `NONE`, `MASK DB`, and `MASK VB` are disclosed decoder-readout controls and have deterministic tests | Passed: all three states observed |
| Scientific boundary | No target steering, collision recovery, autonomous navigation, life/consciousness claim, or biological-ablation claim | Passed: source audit and public copy |
