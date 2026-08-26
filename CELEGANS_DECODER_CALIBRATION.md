# C. elegans DB/VB decoder calibration

The active runtime executes the checksum-verified **279-neuron / 6,261-edge C. elegans source topology**. Its field encoding, LIF dynamics, DB/VB group aggregation, motor decoder, and presentation-body scaling remain **MODELLED MAPPING**. This note documents display-scale limits; it does not claim a biomechanical simulation, validated locomotion, awareness, or autonomous navigation.

| Parameter | Applied value | Basis and limit |
|---|---:|---|
| Full-drive crawl display scale | 0.30 Garden units/s | Selected from the approximately 300 μm/s wet-agar crawling reference; Garden units are not millimetres. [1] |
| Context range | 0.30–0.50 mm/s | Published wet-agar and agar sinusoidal estimates vary with substrate and protocol. [1] [2] |
| Continuous curve cap | 0.45 rad/s | A conservative presentation cap that keeps gentle DB/VB asymmetry distinct from abrupt reorientation classes; it is not an experimentally fitted angular-velocity value. [3] |
| DB/VB display | Group mean of modelled LIF `firingRate` | Read directly from indices selected by source cell names; it is not an electrophysiological recording. |

The decoder uses summed DB/VB mean activity to create forward drive and the DB–VB difference to create a continuous curvature command. It contains no baseline forward drive, target selection, obstacle avoidance, wind-to-turn term, or navigation policy. A zero source motor readout produces a zero movement command.

## References

[1] Rabets, Y. et al. “Direct Measurements of Drag Forces in *C. elegans* Crawling Locomotion.” *Biophysical Journal* (2014). https://pmc.ncbi.nlm.nih.gov/articles/PMC4213666/

[2] Park, S. et al. “Enhanced *Caenorhabditis elegans* Locomotion in a Structured Microfluidic Environment.” *PLOS ONE* (2008). https://doi.org/10.1371/journal.pone.0002550

[3] Stephens, G.J. et al. “From Modes to Movement in the Behavior of *Caenorhabditis elegans*.” *PLOS ONE* (2010). https://doi.org/10.1371/journal.pone.0013914
