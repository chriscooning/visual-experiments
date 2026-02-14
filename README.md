# visual-experiments

Fun visual experiments with generative art, fractals, Perlin noise, swarm intelligence, and emergent systems. All browser-based, no dependencies.

## Noise & Fractals

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

### [Dot Terrain](dot-terrain.html)
A 3D particle grid displaced by layered Perlin noise with surface-normal lighting. Undulating hills and valleys animate across a fullscreen canvas.

- Perspective camera with adjustable height, tilt, and distance
- Surface-normal diffuse lighting with exponential depth fog
- Configurable grid resolution (columns/rows), noise scale, amplitude
- 6 color palettes, dot size control, save as PNG
- Press **H** to toggle control panel

## Swarm & Emergence

### [Boids](boids.html)
Flocking simulation with separation, alignment, and cohesion. Thousands of autonomous agents form murmurations and split/merge in real time.

- Spatial hashing for O(N) neighbor lookup
- Adjustable separation, alignment, cohesion weights
- Click to attract, right-click to repel, scroll to adjust perception radius
- Motion trails, 6 palettes, save as PNG

### [Particle Life](particle-life.html)
Multiple species with randomized attraction/repulsion rules. Emergent ecosystems form as clusters chase, orbit, and merge.

- K x K species interaction matrix (randomizable)
- Matrix overlay shows current rules (green = attract, red = repel)
- Click to spawn particles, scroll to adjust interaction radius
- Wrap-around world with friction damping

### [Physarum](physarum.html)
Slime mold simulation where agents deposit and sense chemical trails. Self-organizing networks converge on optimal paths.

- Up to 200,000 agents with sense-rotate-deposit-move cycle
- Trail map with 3x3 box blur diffusion and configurable decay
- Click to spawn agent clusters, scroll to adjust sensor angle
- ImageData pixel-level rendering, 6 palettes

## Fields & Patterns

### [Curl Noise](curl-noise.html)
Particles follow the curl of a Perlin noise field — divergence-free flow with smooth streams, spirals, and interactive attractors.

- Curl computed via finite differences on Perlin fbm
- Click to place attractors, right-click for repulsors
- Configurable trail length, particle speed, noise scale
- Edge respawning keeps the field populated

### [Reaction-Diffusion](reaction-diffusion.html)
Gray-Scott model producing spots, stripes, coral, mitosis, and worm patterns.

- Two-chemical system with Laplacian diffusion
- Presets: Mitosis, Coral, Spots, Stripes, Worms
- Click + drag to paint chemical B, scroll to adjust brush size
- Half-resolution simulation scaled up for performance

### [Voronoi Relaxation](voronoi.html)
Lloyd's algorithm iteratively relaxes random seed points toward even spacing. Perlin noise perturbation keeps the diagram alive.

- Three draw modes: Cells, Edges, Points + Delaunay
- Brute-force Voronoi at 1/4 resolution for performance
- Click to add seed points, drag to push nearby seeds
- Configurable relaxation speed and noise amount

## Run

Just open `index.html` in a browser. No build step, no dependencies. Or host on GitHub Pages.

## Live

Enable GitHub Pages on the repo (Settings → Pages → Deploy from branch → `main`) and it'll be live at `https://chriscooning.github.io/visual-experiments/`.

## License

Do whatever you want with it.
