# Digital Fly — Design Exploration

## Three Candidate Directions

### 1. Research Observatory

**Very Brief Intro:** A restrained computational-neuroscience instrument that feels like a contemporary field station: dense with evidence, calm in mood, and humane in its treatment of uncertainty. The interface lets the live organism remain the visual event while the controls read as measured annotations.

**Probability:** 0.07

### 2. Museum Specimen Cabinet

**Very Brief Intro:** A warm, archival interface inspired by natural-history drawers, glass slides, inked labels, and color-coded neural stains. It would make each experiment feel like a curated biological observation rather than a gaming dashboard.

**Probability:** 0.03

### 3. Luminous Connectome Lab

**Very Brief Intro:** A dark, instrument-panel visual language with sculptural 3D volume, thin analytic lines, and biofluorescent signal color. It deliberately avoids cyberpunk excess; illumination is used only to explain active neural activity and living environmental gradients.

**Probability:** 0.08

---

# Chosen Direction: Luminous Connectome Lab

## Design Movement

**Scientific information design meets precision laboratory instrumentation.** The experience combines the visual discipline of late-modern research interfaces with the spatial tactility of an interactive scientific exhibit. It should read as a measurement surface, not as sci-fi decoration.

## Core Principles

1. **Evidence is legible.** Every significant component exposes whether it is `SOURCE DATA`, a `MODELLED MAPPING`, or a `SYNTHETIC TEST FIXTURE`; color, label, and placement never imply biological certainty that the code cannot support.
2. **The organism is the anchor.** The fly and its physical world are the visual center. Controls frame the environment like field instrumentation rather than competing with it as opaque dashboard cards.
3. **Activity earns brightness.** Most surfaces remain mineral-black and quietly matte. Amber-gold marks sensory input, icy cyan traces derived output, and magenta signals only currently active neural events.
4. **Systems stay spatial.** Avoid generic centered panels. The environment is observed through an asymmetric triptych: brain telemetry at left, embodied world at center, evidence and experiment controls at right, with a low temporal strip running beneath.

## Color Philosophy

The background is a near-black **basalt navy** (`#071018`) that recalls an imaging room without collapsing into generic black. Neutral surfaces use smoky blue-gray so that data does not glare. The ownable signature color is **Axonal Magenta** (`#FF3D8D`): a restrained, high-energy indicator reserved for spikes, live pathways, and one primary simulation action. Supporting colors carry semantic meaning rather than decoration: **Photoreceptor Gold** for stimuli, **Glial Cyan** for computed output, and **Specimen Ivory** for scientific labels. This palette lets the user tell source, state, and causality apart at a glance.

## Layout Paradigm

An **asymmetric observation bench** fills the screen. The central live world is an expansive, almost-square viewport; a narrow left evidence rail hangs alongside it, while a broader right experiment rail contains manipulable stimulus controls and an inspectable verdict. A running neural timeline bridges the width at the bottom. On smaller screens, the world remains primary while the rails collapse into intentional, labeled drawers rather than a shuffled card grid.

## Signature Elements

1. **The axon trace:** Fine magenta/cyan lines arc between a compact connectome cluster and the body/world view, becoming visible only when activity crosses a meaningful threshold.
2. **Calibration labels:** Condensed all-caps micro-labels sit against a thin ruleset, making panel states look like measured observations rather than marketing headings.
3. **Glass specimen panes:** Low-opacity mineral panels with a single bright corner index create depth without an excess of rounded cards.

## Interaction Philosophy

Interactions should resemble adjusting a real experimental rig. A stimulus is selected, positioned, and then committed; the interface responds promptly with causal feedback in the timeline and inspector. Hovering identifies, clicking inspects, and drag gestures manipulate environmental probes. Dangerously broad claims are not interactive: the interface must surface uncertainty and data provenance in place.

## Animation

Neural events use short 180–240 ms bursts along the axon traces, with modest bloom that decays rather than looping indefinitely. The body should have continuous, physically motivated antenna, leg, and wing response—never a canned celebratory animation. Panels enter with 120–180 ms opacity/translation transitions, staggered by 35 ms. Respect `prefers-reduced-motion` by removing all non-essential pulses and turning dynamic traces into static state changes.

## Typography System

**Space Grotesk** is the technical display voice for measured headings, labels, and numeric states; it gives the interface compact, engineered geometry. **Source Serif 4** is used sparingly for explanatory paragraphs and scientific limitations, adding editorial seriousness without softening control surfaces. All data labels use uppercase with tracking; numerical values use tabular figures; experiment names use sentence case with a direct, factual hierarchy.

## Brand Essence

**Digital Fly is a browser-first observation bench for testing how a full biological connectome could participate in a closed embodied loop.**

**Personality:** rigorous, tactile, candid.

## Brand Voice

Headlines are precise and observational; calls to action sound like deliberate experimental operations, not invitations to “get started.” Microcopy names the nature of uncertainty before it offers a control.

> “Trace the signal from odor field to motor decode.”

> “Load a verified release before claiming full-connectome execution.”

## Wordmark & Logo

The mark is a **six-rayed compound-eye aperture**: six offset teardrop facets orbit a central synapse dot, forming a fly-eye silhouette and an abstract neural junction. It has no text and remains recognizable at small scale. The logotype extends the mark with a spaced, custom-cut `DIGITAL FLY` wordmark whose `A` aperture mirrors the central facet.

## Signature Brand Color

**Axonal Magenta — `#FF3D8D`**

## Non-Negotiable Build Decisions

All visual, component, and canvas choices will reinforce the Luminous Connectome Lab: mineral-dark laboratory surfaces, clear source/modelling labels, asymmetric observatory layout, and illumination only where the simulation has a meaningful state change.

## Style Decisions

- Every route opens immediately to an asymmetric observation surface: a central embodied world, evidence/control rails, a low temporal strip, and a visible provenance tag.
- Axonal Magenta is restricted to active neural signal, live pathway emphasis, and the primary simulation operation. Structural dividers, fixture warnings, and generic decoration use neutral, gold, or cyan materials instead.
- The compound-eye aperture and `DIGITAL FLY` wordmark remain visible in the initial viewport. Copy describes explicit laboratory actions such as tracing a signal or stepping an experiment; it does not use generic marketing invitations.
- The dual-species selector changes the central modelled specimen and its contextual evidence in one operation; it must never make the synthetic neural fixture appear to be a real species-specific connectome.
- The visible body-reference licence is an evidence label, not a claim that a high-resolution source mesh or biological neural data is being executed.
- Liquid glass is a functional material, not decoration: translucent surfaces keep a single hierarchy, use restrained blur and a fine bright edge, and never stack opaque cards over the specimen.
- The header becomes a compact floating capsule containing only the aperture mark, specimen/runtime state and one contextual time-of-sky signal; repeated title and telemetry chrome are removed.
- The sky must fill the full upper field at every camera angle. A camera-following equirectangular sky material replaces the current screen-layer blend; its day/night crossfade remains presentation-only.
- The initial viewport must remain informative even if WebGL is still initializing or a capture tool cannot rasterize the canvas: the branded garden primer holds a visible world field beneath the transparent canvas, while the evidence rail, control rail and temporal strip retain their semantic accents.
