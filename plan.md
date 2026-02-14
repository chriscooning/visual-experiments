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
| `data-conversion.html` | Done | Streaming rivers, funnel flow, A/B split |
| `model-evaluation.html` | Done | Radar charts, score clouds, divergence view |
| `agent-observability.html` | Done | Trace tree, agent flow, tool timeline |

Index page sections: "Noise & Fractals" (3 cards), "Swarm & Emergence" (3 cards), "Fields & Patterns" (3 cards), "Data & AI" (3 cards).

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

---

## Planned: Data & AI Section

Add a fourth section **"Data & AI"** to the index with exactly 3 cards. Each card links to a new single-file experiment with multiple modes (like fractal-experiments.html or reaction-diffusion.html). No integration into existing experiments.

### Index changes

Update `index.html` to add the new section after "Fields & Patterns":

```html
<div class="section-label">Data &amp; AI</div>
<a class="card" href="data-conversion.html">
  <h2>Data &amp; Conversion</h2>
  <p>Streaming rivers, funnel flow, and A/B split. Particles flow, aggregate, and convert — visualizing throughput, churn, and split tests.</p>
  <span class="tag">Flow · Funnel · Conversion</span>
</a>
<a class="card" href="model-evaluation.html">
  <h2>Model Evaluation</h2>
  <p>Radar charts, score clouds, and divergence view. Compare models by accuracy, latency, and hallucination with animated overlays.</p>
  <span class="tag">LLM · Metrics · Comparison</span>
</a>
<a class="card" href="agent-observability.html">
  <h2>Agent Observability</h2>
  <p>Trace trees, agent flow, and tool timelines. Recursive branches and flow paths show tool calls, nesting, and parallel execution.</p>
  <span class="tag">Traces · Agents · Tools</span>
</a>
```

### New file 1: data-conversion.html

**Modes (select dropdown):**

- **Streaming Rivers** — Dense particle streams flowing from edges, aggregating into clusters. Throughput = density; clusters = hotspots. Reuse curl-noise flow logic with directional bias and higher particle count.
- **Funnel Flow** — Particles enter a wide funnel, some drop out along the way (different color/fade). Width = stage; dropouts = churn. Flow field with attractor toward narrow exit.
- **A/B Split** — Two parallel streams branching from one source. Flow rate and color = conversion. Particles can "convert" between streams. Branch from curl-noise or simple directional flow.

**Shared controls:** Palette, particle count, speed, trail fade. Mode-specific: funnel width, dropout rate, split ratio.

**Reference implementations:** curl-noise.html (flow, particles, attractors), physarum.html (trails).

### New file 2: model-evaluation.html

**Modes (select dropdown):**

- **Radar Charts** — Overlapping polygons for 3–5 "models" with axes: accuracy, latency, cost, hallucination rate. Animated transitions when scores change. Simulated scores driven by Perlin or sliders.
- **Score Clouds** — Particles (evaluation runs) that cluster by score. Color = model; clustering = agreement; outliers = anomalies. Similar to particle-life but with explicit score dimension.
- **Divergence View** — Two parallel streams (ground truth vs model output) that diverge on mismatch, converge on match. Divergence = hallucination. Flow-based with branching.

**Shared controls:** Palette, speed. Mode-specific: number of models, metric weights, score ranges.

**Reference implementations:** particle-life.html (clustering, species colors), fractal-experiments.html (radial drawing), curl-noise.html (flow).

### New file 3: agent-observability.html

**Modes (select dropdown):**

- **Trace Tree** — Recursive branching (like twin-tree or cyber-fern). Each branch = tool call; depth = nesting; length = duration; color = status (success/error/timeout). Reuse fractal recursion + noise displacement.
- **Agent Flow** — Flow-field paths where particles split at decision points. Branches = tools/agents; width = traffic; color = outcome. Curl-noise with explicit branching logic.
- **Tool Timeline** — Horizontal timeline with vertical spikes for tool calls. Overlapping = parallel; height = duration. Bars or arcs. Optional radial "clock" layout.

**Shared controls:** Palette, speed, depth/iterations. Mode-specific: branch count, error rate, parallel vs sequential bias.

**Reference implementations:** fractal-experiments.html (twinTree, cyberFern, recursion), curl-noise.html (flow, particles).

### Conventions for new files

All three files must follow shared conventions: dark theme #0a0a0c, Space Mono + Outfit fonts, fullscreen canvas, glassmorphism panel (H toggle), hint pill, FPS counter, Play/Pause + Generate + Save PNG buttons, palette select, randomizeControls/randomizeSelect on Generate, mode selector as first control.

### Implementation order

1. **data-conversion.html** — Easiest; builds directly on curl-noise flow + attractors.
2. **agent-observability.html** — Trace tree reuses fractal recursion; agent flow reuses curl-noise.
3. **model-evaluation.html** — Radar is custom drawing; score clouds and divergence build on particle/flow patterns.
4. **index.html** — Add section and 3 cards.
5. **plan.md** — Update file inventory with new files. **README.md** — Add Data & AI section with descriptions for each experiment and their modes.
