---
layout: page
title: Image Severity Ranking in Ophthalmology
description: Expert-centric severity representation learning for medical images
img:
importance: 2
category: past
related_publications: true
---

**Sep 2022 – Dec 2023** · USC, with collaborators in ophthalmology

Clinicians reason about disease as a matter of degree, not just presence or absence. This project learns representations of disease _severity_ from medical images, with a focus on glaucoma. The goal is models that rank images the way experts do and can explain their rankings.

#### Highlights

- **ConPro**: a severity representation learning framework combining contrastive learning and preference optimization. It outperforms state-of-the-art methods by 6% in F1 score {% cite nguyen2024conpro %}.
- **SiameN and SEMISE**: expert-centric severity ranking models, through explainable pairwise n-hidden comparison {% cite nguyen2025explainable %} and semi-supervised severity representation learning {% cite tran2025semise %}. Together they improve IoU explainability by 6% and ranking performance by 3% in F1 score.
- **Clinical evaluation**: comparing deep learning and clinician performance for detecting referable glaucoma from fundus photographs in a safety-net population {% cite nguyen2025comparison %}.
