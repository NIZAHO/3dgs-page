# Page content provenance

Reviewed on 2026-10-06. Public-facing summary authorized by the repository owner. No raw images, private datasets, checkpoint files, tokens, host addresses, or engineering source trees have been copied into this website.

## Sources

All paths below are in NIZAHO/3dgs and may require repository access.

- `README.md`: stage architecture and input contracts. Retrieved from main.
- `docs/stages/stage9.md`: native SH0 profile, paired RGB/LiDAR updates, maintenance, learned image corrections, checkpoint limitations. Retrieved from main.
- `docs/stages/stage10.md`: LCY/PLY, SOG, coordinate transforms, CPU compression versus GPU viewing, publishing boundaries. Source blob: `753c9b80e8ac0637d9c1d5e2d905c502a338c6c3`.
- `experiments/pipelines/20261002_133957_fresh/README.md`: ALL metrics and counts in the page. Source blob: `3eb0bfe5005d10da24a91618c30ef30af396cb35`.
- `src/gs/native/PROVENANCE.json`: upstream attribution. Source blob: `8139633930dad28768d2e18d3a3b1cc4ba63ad7c`. The native backend imports `yqx674834119/3dgs_CUDA`, Linux commit `39578a089474b4342a050023b5f068a84bf06ee9`.

## Recorded run, not a benchmark comparison

Dataset/run: 133957 / 20261002_133957_fresh, completed 2026-10-03.
7,770 training views, 204,249 paired LiDAR/RGB updates, approximately 1,489 seconds training, 10,294,046 exported Gaussians, 106.13 MiB SOG.
Frozen-checkpoint per-view equal-weight means: raw PSNR 19.8594 dB / SSIM 0.777927; toned PSNR 25.3347 dB / SSIM 0.809903.
Raw and toned share learned cameras and distortion. Only toned uses learned appearance. No test-time parameter fitting. These are training-view scores, not held-out evaluation, SOG scores, or evidence of an advantage over another method.

## Figure provenance

`assets/overview.svg` is an original hand-authored vector method illustration. It was NOT made by an image-generation model. No CVPR affiliation, acceptance, or publication is claimed. The figure uses the layout conventions of a computer-vision method overview.
The in-page Gaussian scale/opacity illustration is synthetic SVG geometry, not a real reconstruction, training visualization, or renderer.
The training tabs are an explanatory lifecycle, not executable training or measured gradients.

## Scene availability

The full-run record says its Stage 10 public/browser files were cleaned. No real scene asset is present on this page. A future viewer must point to a newly provided, authorized Stage 10 public export and should load only after a deliberate user action. Never substitute a synthetic graphic for a real result without labeling it.

## Design reference

Mem2Gen inspired the editorial pacing: serif type, narrow prose, wide illustrations, restrained color, annotated interactive explanations, and evidence with limits. Page code and figures were authored independently, not copied.
