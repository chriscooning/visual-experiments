# Visual Experiments — Project Plan

## Project overview

Browser-based generative art experiments. All self-contained single HTML files, no dependencies, no build step. Dark theme (#0a0a0c), Space Mono + Outfit fonts, fullscreen canvas with floating glassmorphism control panel (H key toggle), hint pill, FPS counter, Play/Pause + Generate + Save PNG buttons, auto-play on load.

Live at: `https://chriscooning.github.io/visual-experiments/`

---

## Current file inventory

| File | Status | Description |
|------|--------|-------------|
| `index.html` | Done | Landing page with 3-column card grid, section labels |
| `README.md` | Done | Full project docs |
| `radial-noise.html` | Done | Perlin noise radial lines, 5 styles, 7 boundaries |
| `fractal-experiments.html` | Done | 7 fractals with noise displacement |
| `dot-terrain.html` | Done | 3D perspective dot grid with surface-normal lighting |
| `boids.html` | Done | Flocking — spatial hashing, 3-rule steering, triangle agents, trails |
| `particle-life.html` | Done | Multi-species attraction/repulsion matrix, matrix overlay |
| `physarum.html` | Done | Slime mold — agent sense/deposit, trail map diffusion/decay, ImageData |
| `curl-noise.html` | Done | Divergence-free Perlin curl flow field, interactive attractors |
| `reaction-diffusion.html` | Done | Gray-Scott model, presets (mitosis/coral/spots/stripes/worms), brush |
| `voronoi.html` | Done | Lloyd's relaxation, 3 draw modes, noise perturbation |

Index page sections: "Noise & Fractals" (3 cards), "Swarm & Emergence" (3 cards), "Fields & Patterns" (3 cards).

---

## Completed: Randomize controls on Generate

### Problem

Currently, the Generate button across ALL experiments only re-seeds the Perlin noise / reinitializes agents/grid and resets time. It does NOT randomize the slider and select values. Every Generate produces the same parameter shape — just a different noise seed.

### Goal

When the user clicks Generate, randomize all "creative" control values within their min/max range, update both the slider `.value` and the `.val` display span, then re-initialize and render.

### Implementation pattern

Add a `randomizeControls()` helper to each experiment. Example:

```javascript
function randomizeControls(ids) {
  ids.forEach(id => {
    const el = $(id), vEl = $(id + 'Val');
    const min = +el.min, max = +el.max, step = +el.step || 1;
    const val = min + Math.floor(Math.random() * ((max - min) / step + 1)) * step;
    el.value = val;
    if (vEl) vEl.textContent = val;
  });
}
```

For select elements, pick a random option:

```javascript
function randomizeSelect(id) {
  const el = $(id);
  const opts = el.options;
  el.selectedIndex = Math.floor(Math.random() * opts.length);
}
```

### Per-experiment details

Which controls to randomize (exclude count/speed/sim-speed for performance/UX):

**radial-noise.html** — Read the file to identify all slider IDs and select IDs. Randomize all creative params (noise, amplitude, line count, etc.) and palette/style/boundary selects. Keep speed as-is.

**fractal-experiments.html** — Randomize: depth (clamped to fractal limit), noiseScale, amplitude, scale, stroke, rotation. Randomize: fractal select, palette select. Keep speed as-is.

**dot-terrain.html** — Randomize: noiseScale, amplitude, camHeight, camTilt, camDist, dotSize. Randomize: palette. Keep cols/rows/speed as-is.

**boids.html** — Randomize: sep, ali, coh, perc, spd (max speed), trail, size. Randomize: palette. Keep count as-is.

**particle-life.html** — Randomize: radius, fric, force, size, species. Randomize: palette. Also randomize matrix (already happens). Keep count as-is.

**physarum.html** — Randomize: sAngle, sDist, turn, move, deposit, decay, diffuse. Randomize: palette. Keep count as-is.

**curl-noise.html** — Randomize: nScale, nSpeed, spd, trail, curl, size. Randomize: palette. Keep count as-is.

**reaction-diffusion.html** — Randomize: feed, kill, dA, dB. Randomize: palette, preset (and apply preset values). Keep simSpeed/brush as-is.

**voronoi.html** — Randomize: relax, noise, nSpeed, edgeW. Randomize: palette, drawMode. Keep count as-is.

### Steps

1. Add `randomizeControls()` and `randomizeSelect()` helpers to each file
2. Call them from the existing Generate click handler, BEFORE re-init/re-seed
3. For reaction-diffusion: if preset is randomized, also apply that preset's feed/kill values
4. For fractal-experiments: after randomizing fractal select, clamp depth to that fractal's limit
5. Test each experiment — click Generate a few times, verify sliders update and visuals change

---

## Known issues / polish backlog

- **particle-life.html**: CSS `canvas` selector was too broad, hitting the matrix overlay canvas. Fixed by scoping to `#canvas`. (Already committed.)
- Consider adding a "Randomize" button separate from Generate if users want to keep the current seed but shuffle params.
- Physarum performance at 200k agents may drop below 60fps on older hardware — consider capping the default lower or adding adaptive frame skipping.
- Voronoi brute-force gets slow above ~300 points — could add a performance warning or cap.

---

## Shared conventions (for reference)

- **Fonts**: `@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;500&display=swap')`
- **Panel**: `position:fixed;bottom:20px;right:20px;backdrop-filter:blur(12px);background:rgba(10,10,12,0.8);border:1px solid rgba(255,255,255,0.06);border-radius:12px;width:220px`
- **Panel toggle**: H key, `.panel.hidden { transform:translateX(calc(100% + 40px)) }`
- **Hint pill**: `position:fixed;bottom:20px;left:20px`, fades after 4s
- **Buttons**: Play/Pause (green when playing), Generate (primary/white), Save PNG
- **Palettes**: Monochrome, Cool Blues, Warm Ember, Neon, Cyber, Gold
- **Slider pattern**: `<label>Name <span class="val" id="fooVal">default</span></label><input type="range" id="foo" min="..." max="..." value="...">`
- **Wiring pattern**: `$(id).addEventListener('input', () => { $(id+'Val').textContent = el.value; if(!playing) render(); })`
