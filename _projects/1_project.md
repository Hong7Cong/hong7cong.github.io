---
layout: page
title: Speech Production on Real-time MRI Video
description: Video world models, diffusion synthesis, and multimodal encoders for real-time MRI of the vocal tract
img: assets/img/publication_preview/rtmri_avatar.png
importance: 1
category: ongoing
related_publications: true
---

<div class="row justify-content-sm-center mb-1">
  <div class="col-sm-10">
    <a href="{{ '/assets/mri-voice-lab-v4/index.html' | relative_url }}" target="_blank" rel="noopener noreferrer" title="Open the MRI Voice Lab interactive demo">
      {% include figure.liquid loading="eager" path="assets/img/publication_preview/rtmri_avatar.png" alt="MRI Voice Lab: articulator contours for lips, jaw, tongue, velum, and larynx traced on a real-time MRI frame" class="img-fluid rounded z-depth-1" %}
    </a>
  </div>
</div>
<div class="caption mb-4">
  Click the image to open <b>MRI Voice Lab</b>, an interactive demo: drag the tongue, lips, jaw, velum, or larynx on a real-time MRI clip and hear a simplified vocal-tract model respond.
</div>

**Sep 2023 – Present** · Signal Analysis and Interpretation Laboratory (SAIL), USC

Real-time MRI (rtMRI) captures the full vocal tract in motion during speech: tongue, lips, velum, and larynx. This makes it a uniquely rich signal for studying how humans produce speech. It also matters for clinical speech applications. This project develops video models that learn the temporal dynamics of articulation directly from rtMRI.

#### Highlights

- **Arti-JEPA**: a video world model adapted to rtMRI for speech-production analysis. It doubles cross-domain phoneme decoding over pretrained baselines and supports a range of downstream applications to clinical speech {% cite nguyen2026artijepa %}.
- **Speech2rtMRI**: the first audio-guided diffusion model for real-time MRI synthesis of the vocal tract. Expert phoneticians misidentified up to 34% of the generated samples as authentic {% cite nguyen2025speech2rtmri %}.
- **Interpretable articulatory modeling**: a multimodal video encoder for rtMRI that fuses optical flow with 6-channel region-of-interest inputs, reducing phoneme recognition error rate by 5% {% cite park2026interpretable %}.
- **Articulation vs. acoustics**: disentangling the contributions of articulatory and acoustic signals in multimodal phoneme recognition {% cite foley2025disentangling %}.
