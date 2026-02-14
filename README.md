# visual-experiments

Fun visual experiments with generative art, fractals, and Perlin noise. All browser-based, no dependencies.

## Experiments

### [Radial Perlin Noise](radial-noise.html)
Animated lines radiating from a moveable origin through noise fields. Five drawing styles (flow lines, petals, spirals, field lines, waves), seven boundary shapes, independent center shape, six color palettes.

- Click + drag to reposition origin
- Mousewheel to resize center radius
- Play/pause animation
- Save as PNG

### [Fractal Experiments](fractal-experiments.html)
Seven classic fractals with Perlin noise displacement and animation:

- **Spiral Septagon** — Recursive heptagons with noise-twisted vertices
- **Lévy C Curve** — Iterative midpoint construction with organic warping
- **Twin Christmas Tree** — Mirrored binary trees with noise-modulated branching
- **Sierpinski Carpet** — Recursive square subdivision with displaced holes
- **Cyber Fern** — Barnsley fern IFS with noise-mutated affine transforms
- **Golden Dragon** — Dragon curve with golden ratio fold angles
- **Vicsek Fractal** — Cross-shaped recursive pattern with per-cell rotation

All fractals share: click + drag to reposition, scroll to change recursion depth, rotation control, scale, speed, stroke weight, and 8 color palettes.

## Run

Just open `index.html` in a browser. No build step, no dependencies. Or host on GitHub Pages.

## Live

Enable GitHub Pages on the repo (Settings → Pages → Deploy from branch → `main`) and it'll be live at `https://chriscooning.github.io/visual-experiments/`.

## License

Do whatever you want with it.
