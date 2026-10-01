---
layout: page
title: Speech Production on Real-time MRI Video
description: Video world models, diffusion synthesis, and multimodal encoders for real-time MRI of the vocal tract
img:
importance: 1
category: ongoing
related_publications: true
---

**Sep 2023 – Present** · Signal Analysis and Interpretation Laboratory (SAIL), USC

Real-time MRI (rtMRI) captures the full vocal tract in motion during speech: tongue, lips, velum, and larynx. This makes it a uniquely rich signal for studying how humans produce speech. It also matters for clinical speech applications. This project develops video models that learn the temporal dynamics of articulation directly from rtMRI.

#### Interactive demo: MRI Voice Lab

Drag the tongue (tip, dorsum, root), lips, jaw, velum, or larynx on a real-time MRI clip. You can see the airway change and hear a vocal-tract model respond. Each articulator's motion is limited to the range observed in this clip. Sound comes from a simplified tube model of the vocal tract, so it is an illustration, not a reconstruction of the speaker's voice. Press **Play clip** to hear the original recording, or drag any handle to switch to live synthesis.

<div class="mri-voice-lab-embed mb-2">
  <iframe
    id="mri-voice-lab"
    src="{{ '/assets/mri-voice-lab/index.html' | relative_url }}"
    title="MRI Voice Lab: interactive real-time MRI vocal tract demo"
    loading="lazy"
    allow="autoplay"
    style="width: 100%; height: 1150px; border: 1px solid var(--global-divider-color); border-radius: 8px; background: #f6f2ef"
  ></iframe>
</div>
<p class="text-right small">
  <a href="{{ '/assets/mri-voice-lab/index.html' | relative_url }}" target="_blank" rel="noopener noreferrer">Open the demo full screen <i class="fa-solid fa-up-right-from-square"></i></a>
</p>

<script>
  // Grow the iframe to fit the demo so it doesn't need its own scrollbar.
  (function () {
    const frame = document.getElementById("mri-voice-lab");
    const fit = () => {
      try {
        const doc = frame.contentDocument;
        if (doc && doc.documentElement) frame.style.height = doc.documentElement.scrollHeight + "px";
      } catch (e) {}
    };
    frame.addEventListener("load", () => {
      fit();
      try {
        new ResizeObserver(fit).observe(frame.contentDocument.documentElement);
      } catch (e) {}
    });
  })();
</script>

#### Highlights

- **Arti-JEPA**: a video world model adapted to rtMRI for speech-production analysis. It doubles cross-domain phoneme decoding over pretrained baselines and supports a range of downstream applications to clinical speech {% cite nguyen2026artijepa %}.
- **Speech2rtMRI**: the first audio-guided diffusion model for real-time MRI synthesis of the vocal tract. Expert phoneticians misidentified up to 34% of the generated samples as authentic {% cite nguyen2025speech2rtmri %}.
- **Interpretable articulatory modeling**: a multimodal video encoder for rtMRI that fuses optical flow with 6-channel region-of-interest inputs, reducing phoneme recognition error rate by 5% {% cite park2026interpretable %}.
- **Articulation vs. acoustics**: disentangling the contributions of articulatory and acoustic signals in multimodal phoneme recognition {% cite foley2025disentangling %}.
