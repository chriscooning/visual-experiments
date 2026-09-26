# visual-experiments

Browser-based generative art: fractals, Perlin noise, swarm intelligence, reaction-diffusion, emergent systems, and WebGPU light. No build step: every experiment is a single HTML file, and the WebGPU ones import a prebuilt [vgpu](https://github.com/vercel-labs/vgpu) bundle from `lib/vgpu.js` (its first line records how it was built).

**[Live →](https://chriscooning.github.io/visual-experiments/)**

## Experiments

**Print & Pattern · WebGPU** (newest first)

Flat silkscreen colour, fine contour bands and hairline ink outlines, crossed with a late-90s digital layer of registration marks, ruler ticks, dimension lines and dot grids. The symbols are their own: California coast, machines and AI, optics and space, and invented sigils.

- **Core Sample**
  - Banded planet with a wedge cut away: layers and a circuit-board core
  - Orbit and satellite, engraved sea
  - Drag to press on the planet

- **Signal Coast**
  - Generated poster: cypresses, a curling wave, a satellite dish, chips, a neural net, a cursor, a ringed planet, gauges, sigils
  - Drag any shape to rearrange, Generate for a new composition

- **Swell Sigil**
  - Dense contour bands following a moving field around an emblem
  - Machine eye, eclipse or a generated sigil
  - Drag to push the swell

**Wire & Signal · WebGPU** (newest first)

- **Ridgelines**
  - Stacked, self-occluding pulsar lines drawn front to back per pixel
  - Touch raises a peak, tilt tips the stack
  - Pulsar, ink, neon, dusk, signal blue

- **Contour Map**
  - Domain-warped terrain with constant-width contours and index lines
  - Hillshade, hypsometric tint, lakes and shoreline
  - Drag to raise or dig, tilt moves the sun

- **Chromatic Lens**
  - Glass lens with twelve-wavelength dispersion over printed scenes
  - Poster, Swiss grid, halftone, barcode, night type
  - Drag the lens, tilt bends the light

- **Radar**
  - Spider chart: three series morphing across 5–12 axes, with labels
  - Radar scope: sweep, afterglow, tracked contacts and sonar ping
  - Tap for new data or a ping

- **Wire Terrain**
  - Ray-marched height field drawn as an anti-aliased wireframe grid
  - Banded sun, bloom, scanlines, chromatic aberration
  - Drag to steer and climb, tilt to bank

**Light & Liquid · WebGPU** (newest first)

These need a browser with WebGPU. Where a phone has a motion sensor, `lib/tilt.js` feeds its tilt in (iOS asks permission on the first tap).

- **Ink in Water**
  - Stable fluids: advection, vorticity confinement, 20-pass pressure solve
  - Ink absorbs light (or glows), sinks with gravity; tilt changes which way is down
  - Drag to stir ink in, drips fall on their own

- **Liquid Chrome**
  - Ray-marched smooth-union metaballs mirroring a procedural studio
  - Drag to pull the metal, tilt to turn the studio
  - Chrome, gold, oil slick, obsidian, candy

- **Caustics Pool**
  - Height-field ripple sim plus analytic swells
  - Caustics from the surface's curvature: 1 / det(I − depth·Hessian)
  - Tap or drag for ripples, rain, tilt to slosh

- **Light Rays**
  - Three-pass god rays: occlusion mask, radial blur, composite
  - Domain-warped fbm clouds, drag to move the light
  - Prism palette splits the rays by channel

**Noise & Fractals**

- **Radial Perlin Noise**
  - Flow lines, petals, spirals, field lines, waves
  - 7 boundary shapes, 6 palettes
  - Click/drag origin, scroll resize, save PNG

- **Fractal Experiments**
  - Septagon, Lévy C, christmas tree, Sierpinski carpet, fern, dragon, Vicsek
  - Noise displacement, animation
  - Scroll depth, rotation, scale

- **Dot Terrain**
  - 3D particle grid, Perlin noise, surface lighting
  - Camera height, tilt, grid resolution
  - H toggles controls

**Swarm & Emergence**

- **Boids**
  - Flocking: separation, alignment, cohesion
  - Click attract, right-click repel
  - Motion trails, 6 palettes

- **Particle Life**
  - Species attraction/repulsion matrix
  - Clusters chase, orbit, merge
  - Click spawn, scroll radius

- **Physarum**
  - Slime mold, chemical trails
  - 200k agents, sense-rotate-deposit
  - Click spawn clusters

- **Attractor Swarms**
  - Lorenz, Rössler attractors, murmuration boids
  - Add multiple attractors, orbit and zoom
  - 3D WEBGL, density-curve gravity

**Fields & Patterns**

- **Curl Noise**
  - Divergence-free flow
  - Click attractors, right-click repulsors
  - Trail length, speed

- **Reaction-Diffusion**
  - Gray-Scott: spots, stripes, coral, mitosis, worms
  - Click/drag paint, scroll brush
  - Presets

- **Voronoi Relaxation**
  - Lloyd's algorithm
  - Cells, edges, points modes
  - Click add seeds, drag push

**Data & AI**

- **Data & Conversion**
  - Rivers, funnel, A/B split
  - Throughput, churn, conversion
  - Funnel width, dropout, split ratio

- **Model Evaluation**
  - Radar charts, score clouds, divergence
  - Accuracy, latency, hallucination
  - Configurable noise

- **Agent Observability**
  - Trace tree, agent flow, tool timeline
  - Tool calls, nesting, parallel
  - Depth, branches, error rate

- **Arize — Horizontal Scroll**
  - Scroll-driven sections, crossfade and scale
  - SVG stroke draw-in, horizontal track
  - Self-contained HTML/CSS/JS

## Run locally

Open `index.html` in a browser.

## License

Do whatever you want with it.
