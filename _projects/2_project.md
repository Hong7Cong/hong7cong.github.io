---
layout: page
title: Temporal Dynamics in Human Speech and Gestures
description: Motion-centric video understanding and rigorous evaluation of human behavior models
img: assets/img/publication_preview/temporal_dynamics.png
importance: 2
category: ongoing
related_publications: true
---

<div class="row justify-content-sm-center mb-3">
  <div class="col-sm-10">
    {% include figure.liquid loading="eager" path="assets/img/publication_preview/temporal_dynamics.png" alt="Attention across space and time between patches of consecutive video frames" class="img-fluid rounded z-depth-1" %}
  </div>
</div>

**Oct 2024 – Present** · Signal Analysis and Interpretation Laboratory (SAIL), USC

Much of what makes human behavior meaningful lives in _how_ people move over time, not in any single frame. This project builds video models that pay explicit attention to motion. It also examines how such models are evaluated in human-behavior research.

#### Highlights

- **MOOSE**: a motion-centric video encoder that uses optical flow to focus on temporal dynamics for fine-grained human activity understanding {% cite nguyen2025moose %}.
- **Autism motor behavior**: improved detection of atypical motor behaviors in autism by 6% accuracy, with enhanced saliency-based explainability.
- **Auditing co-speech gesture evaluation**: showed that learned judges exploit speaker and session shortcuts, reaching 0.92 accuracy with no true speech–gesture coupling. Proposed 3 controls for rigorous evaluation.
- **Real-time action detection**: CAKE, real-time action detection via motion distillation and background-aware contrastive learning {% cite hoang2026cake %}.
