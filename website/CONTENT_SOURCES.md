# Page content provenance

Reviewed on 2026-10-14. The page now leads with the research story "No Pinhole Proxies" (validation phase), in English and Chinese (toggle in the top bar; `?lang=zh` / `?lang=en` in the URL; otherwise the browser language, remembered per visitor). Both languages carry the same content. Public-facing summary authorized by the repository owner. No raw images, private datasets, checkpoint files, tokens, host addresses or engineering source trees have been copied into this website.

## Research story (§01–§06, §09)

Sources, all in NIZAHO/3dgs (main, 2026-10-14):

- `main.tex`, `sections/00_abstract.tex`–`05_limitations.tex`, `tables/*.tex`: paper draft. Every result in it is a placeholder; the page shows none of them.
- `paper/paper_claude_zh/05_contributions.md`: the three contributions, prior-art checks (SimULi, XSIM, Uni-Gaussians, SplatAD, GS-LiDAR, 2DGS, EnerGS, GeoP-Calib), kill criteria.
- `paper/paper_claude_zh/06_experiments_and_timeline.md`, `10_validation_plan_exp1_exp2.md`: validation order, rows, pass rules, run counts.
- `paper/paper_claude_zh/09_repo_evidence.md`: code-level facts about the baseline trainer (centre depth, normalisation only when terminated, no depth gradient, 120°/256² virtual LiDAR camera).
- `references.bib`: reference metadata and links. Links are given only where the bib records a URL or an arXiv identifier.

Numbers on the page are of two kinds only: published by others (Oxford Spires F@10 cm ranges, cited) or read from our code (counts of depth definitions, missing gradient, virtual camera size). The R1 Oxford numbers (23.67 / 21.75 dB) are a single run at an unequal budget and are labelled as such. The 2.9× pixel ratio is a derivation, labelled as such.

## Figures

- Figure 4 (pipeline architecture) is the planned design of C1–C3 next to the baseline R1; it is a diagram of intent, not of implemented code.
- Figure 9 (positioning map) and Table 2 (property matrix) place concurrent work from what each paper and our prior-art notes in `05_contributions.md` state; every table mark has a hover reason. Our own row is a design, labelled as such.

- Figure 1 (teaser), Figure 6 (gate) and Figure 7 (kernel map) are hand-authored schematics drawn in code. They are labelled "Schematic · not data".
- Figure 3 evaluates a synthetic beam (toy numbers stated in its caption). Figure 4 evaluates the printed ray-response formula live on a 2D Gaussian. Figure 5 is a schematic Pareto front illustrating Das & Dennis (1997); it is not measured data.
- Figure 2 shows only published ranges plus an explicit "not yet measured" row.
- Math is typeset with KaTeX 0.16.47 (MIT), self-hosted under `vendor/katex/` with its LICENSE; no runtime CDN.

## Baseline system (§07) and viewer (§08)

All paths below are in NIZAHO/3dgs and may require repository access.

- `README.md`: stage architecture and input contracts. Retrieved from main.
- `docs/stages/stage9.md`: native SH0 profile, paired RGB/LiDAR updates, maintenance, learned image corrections, checkpoint limitations. Retrieved from main.
- `docs/stages/stage10.md`: PLY, SOG, coordinate transforms, CPU compression versus GPU viewing, publishing boundaries. Source blob: `753c9b80e8ac0637d9c1d5e2d905c502a338c6c3`.
- `experiments/pipelines/20261002_133957_fresh/README.md`: ALL metrics and counts in the page. Source blob: `3eb0bfe5005d10da24a91618c30ef30af396cb35`.
- `src/gs/native/PROVENANCE.json`: upstream attribution. Source blob: `8139633930dad28768d2e18d3a3b1cc4ba63ad7c`. The native backend imports `yqx674834119/3dgs_CUDA`, Linux commit `39578a089474b4342a050023b5f068a84bf06ee9`.

## Recorded run, not a benchmark comparison

Dataset/run: 133957 / 20261002_133957_fresh, completed 2026-10-03.
7,770 training views, 204,249 paired LiDAR/RGB updates, approximately 1,489 seconds training, 10,294,046 exported Gaussians, 106.13 MiB SOG.
Frozen-checkpoint per-view equal-weight means: raw PSNR 19.8594 dB / SSIM 0.777927; toned PSNR 25.3347 dB / SSIM 0.809903.
Raw and toned share learned cameras and distortion. Only toned uses learned appearance. No test-time parameter fitting. These are training-view scores, not held-out evaluation, SOG scores, or evidence of an advantage over another method.

## Figure provenance (baseline section)

`assets/overview.svg` is an original hand-authored vector method illustration. It was NOT made by an image-generation model. No CVPR affiliation, acceptance or publication is claimed; "validation phase" and "research preview" describe the state of the work. The earlier synthetic Gaussian scale/opacity demo and training-lifecycle tabs were removed in this revision.

## Scene availability

The full-run record says its Stage 10 public/browser files were cleaned. The project page now includes a self-hosted SuperSplat 1.37.0 viewer, with an explicitly maintained examples/scenes.json list. The list is initially empty. Local PLY previews are never uploaded. PLY is the default model format; bundled SOG is optional. The renderer loads only after a deliberate action. CI uses a tiny synthetic PLY only as a smoke-test fixture, not as a public reconstruction or quality result. Official runtime licensing is deployed with the viewer.

## Design reference

Mem2Gen inspired the editorial pacing and story structure: numbered chapters with a one-sentence claim as heading, a TL;DR with three stat callouts, "What to watch" and "Key takeaway" callouts around interactive figures, equations followed by a plain-language reading, and an explicit scope section. Page code and figures were authored independently, not copied.
