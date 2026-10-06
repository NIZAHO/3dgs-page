# 3dgs project page

A static, source-grounded project page emphasizing Gaussian representation, paired RGB/LiDAR training, adaptive maintenance, recorded results, and SOG browser delivery. Upstream processing is compressed into an expandable summary.

## Preview

From the repository root: `python -m http.server 8000 -d website`, then open http://localhost:8000.

## Files

- `index.html`: accessible article, source notes, figures, evidence, original symmetric navbar SVG.
- `styles.css`: responsive editorial layout, light/dark themes, mobile Contents menu.
- `app.js`: synthetic Gaussian controls, keyboard-operable training tabs, theme toggle, navigation/progress.
- `assets/overview.svg`: editable vector system-overview figure (not an AI-generated image or a real reconstruction).
- `CONTENT_SOURCES.md`: source lineage, exact run counts, limitations, asset provenance.

No build step, package dependency, framework, tracking, or scene download is required. The existing Pages workflow still publishes only `website/` on changes to main. It was not modified by this redesign.

## Editing safeguards

Keep training-view, held-out, and browser/SOG metrics separate. Do not use default Test3 view counts as values for the 133957 run. Do not add Paper/CVPR badges or public-viewer links without real resources. Refer to CONTENT_SOURCES.md before changing technical claims.

## Checks performed

Chromium rendering using the authored local assets: desktop/light and dark layouts, 360/390/768/1024/1440 widths without page-level horizontal overflow, all internal anchors, all four lifecycle tabs, arrow/Home/End keyboard navigation, scale/opacity controls and reset, mobile menu/Escape, and no JavaScript page errors. Google Fonts was blocked during local checking, so fallbacks were also exercised. Storage persistence across navigation was not tested in the local about:blank renderer.
