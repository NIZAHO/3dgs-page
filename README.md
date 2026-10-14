# Chuan project page

Website-only publication repository for Chuan. Project source remains in the private NIZAHO/3dgs repository.

The website presents the research preview "No Pinhole Proxies" (diagnosis, three contributions with their math, validation plan), the baseline system with one recorded run, and an embedded Gaussian scene viewer. It shows hypotheses, not results; see `website/CONTENT_SOURCES.md`.

Edit website/ on main to deploy automatically to GitHub Pages. In Settings → Pages, select GitHub Actions as the source once.

Preview locally:

```sh
python3 -m http.server 8000 --directory website
```
