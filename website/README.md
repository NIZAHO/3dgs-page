# 3dgs project page

Source-grounded project story, Gaussian PLY-first naming, interactive method illustrations, and an embedded scene viewer with manually managed examples.

## Build and preview

```bash
npm ci
npm run build
python -m http.server 8000 -d _site
```

Open http://localhost:8000. Do not serve `website/` directly for the real renderer: the build copies the pinned official SuperSplat bundle into `_site/viewer/`.

## Examples

Edit `website/examples/scenes.json`. See `website/examples/README.md` for local previews, published models, external model URLs, optional camera settings and privacy boundaries. No example is fabricated or downloaded automatically. Default: Gaussian PLY; bundled SOG is optional.

`website/scene-browser.js` manages the public example list and same-origin iframe lifecycle. `website/viewer/viewer.js` loads the pinned renderer after a deliberate action, supports local File objects without uploading, reports loading/error/first-frame state, and destroys its context on unmount.

## Validation

```bash
npx playwright install chromium
npm run build
npm test
```

The browser smoke test uses a tiny synthetic PLY created only under the test output directory, never as a claimed reconstruction or committed/public example. It tests local PLY rendering, configured examples, lazy loading, malformed input, missing URLs, unloading, and desktop/mobile overflow. A software-rendered CI check is not a hardware performance or real-scene quality measurement.

## Deployment

`.github/workflows/chuan-pages.yml` builds and deploys `_site/` after website/build/dependency changes on `main`. Dependencies and licenses are bundled with the deployed site; the public model list remains your explicit choice.
