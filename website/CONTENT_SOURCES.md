# Page content provenance

Reviewed on 2026-10-14. The page presents the method “No Pinhole Proxies” in English and Chinese (toggle in the top bar; `?lang=zh` / `?lang=en`; otherwise the browser language, remembered per visitor). Both languages carry the same content.

## Sources for the text

- The method draft and research notes of the owner’s research repository (paper draft sections, contributions, experiment plan, prior-art checks).
- Reference metadata and links come from the draft’s bibliography; links are given only where it records a URL or an arXiv identifier.
- Published numbers: Oxford Spires F@10 cm ranges for official LiDAR maps and a radiance field (Tao et al., IJRR 2025).

The page shows no measured result of the method. Numbers are either published by others or derivations stated as such (e.g. the 2.9× pixel ratio). Experiments are described by their rows and scoring.

## Figures

- Figures 1, 8 and 9 are hand-authored schematics drawn in code and labelled “Schematic”.
- Figure 3 evaluates a synthetic beam with illustrative numbers. Figure 6 evaluates the printed ray-response formula live on a 2D Gaussian. Figure 7 is a schematic Pareto front illustrating Das & Dennis (1997).
- Figure 4 (pipeline architecture) shows the method next to the common stand-in approach. Figure 5 (positioning map) and Tables 1–2 place related work from what each paper states; every Table 1 mark has a hover reason.
- Math is typeset with KaTeX 0.16.47 (MIT), self-hosted under `vendor/katex/` with its LICENSE; no runtime CDN.

## Scene viewer

Self-hosted SuperSplat Viewer 1.37.0 with an explicitly maintained `examples/scenes.json` list (initially empty). Local PLY previews are never uploaded. The renderer loads only after a deliberate action. CI uses a tiny synthetic PLY only as a smoke-test fixture.

## Design reference

Mem2Gen inspired the editorial pacing and story structure: numbered chapters with a one-sentence claim as heading, a TL;DR with stat callouts, “What to watch” and “Key takeaway” callouts around interactive figures, and equations followed by a plain-language reading. Page code and figures were authored independently, not copied.
