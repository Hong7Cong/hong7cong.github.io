# MRI Voice Lab — revision 04

The revision 03 layout, colors, recording, smooth organ rendering, and transport are retained.

## Open the prototype

Unzip `mri-voice-lab-v4-browser.zip`, then open the extracted `index.html` in a browser. No server, installation, or connection is needed. The file is self-contained. A chat attachment/source preview may display markup; use the extracted file in your browser.

- Drag **Tip**, **Dorsum**, or **Root** to bend the tongue locally. The other two tongue handles remain fixed. Three inferior anchors prevent a whole-tongue translation.
- Select Tongue and then Tip/Dorsum/Root to use the corresponding horizontal/vertical sliders. All three handles stay visible.
- The faint dashed region is the selected tongue landmark's observed trajectory hull. Tissue-envelope and airway-contact constraints can stop a handle before that outline.
- Lips, Jaw, Velum, and Larynx retain their original controls, with bounds derived from this clip. Bounds update when you change frame. Reset returns to that frame's original smoothed segmentation.
- A drag pauses the clip and switches to live synthesis. Reference mode plays the original recording.
- During synthesis playback, “Follow recorded pitch & voicing” uses estimated source features from the WAV. During held-frame sculpting, the pitch slider controls a sustained source.

## Motion constraints

All 210 supplied frames are used. Tongue landmarks are estimated at indices 25, 55, and 94 of the spatially smoothed 100-point contour. The file does not contain anatomical landmark labels or tracked tissue correspondences; these are anterior/superior/posterior surface proxies for tip, dorsum, and root. Their trajectory convex hulls constrain absolute handle positions.

A Gaussian radial-basis interpolation field (9-pixel scale) interpolates all three moving handles and three stationary inferior anchors. Moving one handle changes local curvature while the other two stay in place. It is a geometric deformation, not a muscle or constant-volume model.

Jaw limits come from the observed lower-mask centroid angle about the existing approximate pivot (55,78), with a clip span of 6.69 degrees. Velum/larynx limits use vertical centroid excursions. Lip limits use anterior upper/lower tissue measurements, adjusted for the local deformation weight.

Every deformed organ outline is checked against that tissue's mask union across the clip. The allowed distance outside the union is 0.85 pixels, or the original smoothed vertex's distance plus 0.02 pixels if larger. This accommodates the smooth contour representation; it is not additional anatomical motion. Sampled local-Jacobian and airway-clearance guards restrict folding and wall crossing. Coupled lip/jaw motion also passes the envelope check.

These are **clip-specific estimated limits**, not the speaker's full physiological range. Independent combinations can be inside these envelopes without having occurred in the video. Vertex/envelope, local-folding, and sampled airway checks are not a complete continuous tissue-collision solver.

## Sound changes

The persistent 44-section oral waveguide now uses an original implementation of an LF-shaped glottal derivative, with a continuous exponential return phase and zero cycle mean. It adds low-level aspiration, smooths source/geometry transitions, and filters the output. Playback can follow heuristic pitch, periodicity, and RMS estimates from the reference WAV; those estimates are not the recording waveform passed through the synthesizer. The same edited tube areas used by the display feed the audio thread.

This revision does **not** establish natural-speech quality or reconstruct this speaker. Estimated pitch can contain octave errors. Pixel spacing (2.4 mm/px default) and lateral depth (2.4 cm default) remain assumptions. Width × assumed depth is an approximation to 3D area. Airway sections are attached deformation fields, not a fresh full-airspace segmentation. There is no nasal branch or place-specific consonant turbulence. The 97 frames without a connected source-to-lips airway remain muted in synthesis; their reference audio is intact.

Source-model background: Fant, Liljencrants & Lin (1985), “A four-parameter model of glottal flow.” A primary implementation reference with model documentation is https://github.com/covarep/covarep/blob/master/glottalsource/glottal_models/gfm_spec_lf.m . No code from that implementation is included here.

## Verification

- All 210 neutral shapes satisfy their motion guards.
- 132 extreme single-control requests checked across six representative frames.
- Independent tongue-handle interpolation error below 0.000001 pixel.
- A constrained bend changes the fixed-pitch harmonic spectrum (normalized spectral distance 0.231); rest and edited RMS are both about 0.039. This demonstrates audible-model responsiveness, not perceptual speech quality.
- Dynamic clip synthesis is finite and bounded at 44.1 and 48 kHz; disconnected frames fade to silence.
- DOM/audio stubs exercise initialization, seven handles, organ/tongue selectors, pointer dragging, frame changes, reset, source following, worklet initialization, and configuration delivery.
- The static geometry preview uses the same deformation outputs and cubic contours as the editor.

A real browser rendering or listening comparison was not performed in this environment. The wiring tests do not substitute for a browser or a human listening assessment.

## Source package

Open `mri-voice-lab-v4/index.html` directly, or generate the self-contained HTML with `python build.py`. JavaScript is dependency-free. Run `python build.py` first (it also restores sample.json for analysis), then `node test_geometry.js` and `node test_ui_wiring.js` from this folder.

The source archive includes the supplied input files in `upload/`, and `baseline-sample.json` is the unchanged revision-03 segmentation/atlas/audio data. To regenerate motion/source metadata:

```
python prepare_motion.py
python prepare_source.py
node test_geometry.js
python render_preview.py
python build.py
```

Preprocessing uses NumPy and SciPy; the static geometry preview also uses Matplotlib. No new MRI segmentation network is trained in this revision.
