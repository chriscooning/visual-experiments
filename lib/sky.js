/*
 * sky.js — the day in the sky, for the landscapes that turn through one: the
 * time of day, and where the sun and the moon stand.
 *
 *   import { daySky, dayKey, dayCols } from './lib/sky.js';
 *   const sky = daySky({ hz: HZ, tau: 0.15 }); // horizon (scene y, down), start time
 *   sky.mode = 'timer';          // the day turns on its own; 'click': only when moved
 *   sky.step(dt, rate);          // every frame; rate: days per second while it turns
 *   sky.down(q); sky.move(q);    // pointer in scene units: each says whether the
 *   sky.up();                    //   sky took the press (else it's the page's)
 *   sky.set(tau);                // jump to a time (the Time slider)
 *   const s = sky.bodies();      // { sx, sy, elev, mx, my, mElev, dark }
 *   dayCols(sky.tau, SKIES, LAND, KEEP); dayKey(sky.tau).name;
 *
 * tau runs 0..1 round the clock: afternoon at 0, sunset near 0.3, night
 * through the middle, dawn at 0.8. The sun keeps to its course by day, rising
 * on the left and setting on the right, and the moon to its own by night, the
 * other way. A press in the sky takes hold of whichever is up and puts it
 * wherever the finger goes, and the hour follows it: its height says how far
 * through the day (or the night) it is, and the side of its course it's on
 * whether that's before or after noon (or midnight), so a sun pulled low on
 * the right brings on the evening and one low on the left the dawn. Pulled
 * down under the horizon it sets, and the moon (or the sun) comes up under
 * the finger. Let go and, while the day turns on its own, it carries on from
 * there, easing back onto its course; when it turns only on click, it all
 * stays where it was left.
 */

// The times of day round the clock: the sky each brings, and how it grades
// the land (a multiplier per channel, and a saturation).
export const DAY_KEYS = [
  [0.00, 'afternoon', [1, 1, 1], 1.0],
  [0.18, 'golden hour', [1.08, 0.94, 0.76], 1.12],
  [0.28, 'sunset', [0.98, 0.7, 0.6], 1.05],
  [0.35, 'blue hour', [0.46, 0.5, 0.76], 0.72],
  [0.43, 'night', [0.2, 0.25, 0.42], 0.5],
  [0.73, 'night', [0.2, 0.25, 0.42], 0.5],
  [0.81, 'dawn', [0.86, 0.72, 0.8], 0.85],
  [0.9, 'morning', [1.02, 0.98, 0.94], 0.95],
  [1.0, 'afternoon', [1, 1, 1], 1.0],
];
const SKY_ORDER = ['afternoon', 'golden hour', 'sunset', 'blue hour', 'night', 'night', 'dawn', 'morning', 'afternoon'];
export function dayKey(tau) {
  let i = 0;
  while (i < DAY_KEYS.length - 2 && tau >= DAY_KEYS[i + 1][0]) i++;
  const a = DAY_KEYS[i], b = DAY_KEYS[i + 1];
  let f = (tau - a[0]) / (b[0] - a[0]);
  f = f * f * (3 - 2 * f);
  return { i, f, name: f < 0.5 ? a[1] : b[1] };
}
const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
const lerp3 = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
// The palette for time tau. SKIES: name -> list of hex; LAND: list of hex,
// graded by the light of the moment; KEEP: land indexes left ungraded.
export function dayCols(tau, SKIES, LAND, KEEP) {
  const k = dayKey(tau);
  const A = DAY_KEYS[k.i], B = DAY_KEYS[k.i + 1];
  const sa = SKIES[SKY_ORDER[k.i]], sb = SKIES[SKY_ORDER[k.i + 1]];
  const out = sa.map((h, j) => [...lerp3(hex(h), hex(sb[j]), k.f), 1]);
  const m = lerp3(A[2], B[2], k.f), sat = A[3] + (B[3] - A[3]) * k.f;
  LAND.forEach((h, j) => {
    const c = hex(h);
    if (KEEP.includes(j)) { out.push([...c, 1]); return; }
    const l = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
    out.push([...c.map((v, q) => Math.max(0, Math.min(1, (l + (v - l) * sat) * m[q]))), 1]);
  });
  return out;
}

// The courses: where each body comes up (x0) and goes down (x1) on the
// screen, when it rises and for how much of the clock it's up, and how high
// it climbs over the horizon. f runs 0..1 along a course.
const SUN = { x0: -0.55, x1: 0.35, rise: 0.8, span: 0.51, h: 0.55, dy: 0.02 };
const MOON = { x0: 0.5, x1: -0.45, rise: 0.31, span: 0.49, h: 0.46, dy: 0.04 };
const wrap = (t) => ((t % 1) + 1) % 1;
// How far along its course body b is at time t (1 or more while it's down).
const along = (b, t) => wrap(t - b.rise) / b.span;
// Where body b stands f of the way along its course, and how high (0..1).
function courseAt(b, f, hz) {
  const e = Math.sin(Math.PI * f);
  return [b.x0 + (b.x1 - b.x0) * f, hz - e * b.h + b.dy, e];
}
// The sun and the moon on their courses at time tau: position on screen and
// height above the horizon (-1..1). By night the sun lies under the horizon;
// by day the moon is out of the frame.
export function celestial(tau, hz) {
  const fs = along(SUN, tau);
  if (fs < 1) {
    const [sx, sy, elev] = courseAt(SUN, fs, hz);
    return { sx, sy, elev, mx: 0, my: 2, mElev: -1 };
  }
  const [mx, my, mElev] = courseAt(MOON, along(MOON, tau), hz);
  return { sx: SUN.x1, sy: hz + mElev * SUN.h + SUN.dy, elev: -mElev, mx, my, mElev };
}

export function daySky({ hz, tau = 0.15 }) {
  // Whether a press holds the body that's up; where that body stands off its
  // course (eased away while the day turns on its own); whether it may set
  // when pulled under the horizon (once more after the finger's back in the
  // sky); and whether it was day, to start the next body on its course.
  let held = false, off = [0, 0], armed = true;
  const isDay = (t) => along(SUN, t) < 1;
  let wasDay = isDay(tau);
  const sky = { tau: wrap(tau), mode: 'timer' };

  // Put the body that's up at point q (no lower than where it sets), the
  // hour following its height and which side of its highest point it's on.
  function place(q) {
    const b = isDay(sky.tau) ? SUN : MOON;
    const y = Math.min(q[1], hz + b.dy);
    const e = Math.max(0, Math.min(1, (hz + b.dy - y) / b.h));
    const rising = (q[0] - (b.x0 + b.x1) / 2) * (b.x1 - b.x0) < 0;
    const a = Math.asin(e) / Math.PI;
    const f = Math.max(1e-4, Math.min(1 - 1e-4, rising ? a : 1 - a));
    sky.tau = wrap(b.rise + b.span * f);
    const c = courseAt(b, f, hz);
    off = [q[0] - c[0], y - c[1]];
    wasDay = isDay(sky.tau);
  }
  // Pulled under the horizon, the body up sets and the other comes up under
  // the finger on the same side: the moon rising where the sun went down, or
  // setting where it comes up, so the hour carries straight on.
  function setBody(q) {
    const b = isDay(sky.tau) ? MOON : SUN;
    const rising = (q[0] - (b.x0 + b.x1) / 2) * (b.x1 - b.x0) < 0;
    sky.tau = wrap(b.rise + b.span * (rising ? 1e-4 : 1 - 1e-4));
    armed = false;
    place(q);
  }

  sky.bodies = () => {
    const s = celestial(sky.tau, hz);
    if (isDay(sky.tau)) {
      s.sx += off[0]; s.sy += off[1];
      s.elev = Math.min(1.2, (hz + SUN.dy - s.sy) / SUN.h);
    } else {
      s.mx += off[0]; s.my += off[1];
      s.mElev = Math.min(1.2, (hz + MOON.dy - s.my) / MOON.h);
    }
    s.dark = 1 - Math.min(1, Math.max(0, (s.elev + 0.25) / 0.3));
    return s;
  };
  sky.step = (dt, rate) => {
    if (held || sky.mode !== 'timer') return;
    sky.tau = wrap(sky.tau + dt * rate);
    const day = isDay(sky.tau);
    if (day !== wasDay) { off = [0, 0]; wasDay = day; }
    const k = Math.exp(-dt / 20);
    off = [off[0] * k, off[1] * k];
  };
  sky.set = (t) => { sky.tau = wrap(t); off = [0, 0]; wasDay = isDay(sky.tau); };
  // A press anywhere in the sky, or on the body that's up, takes hold of it.
  sky.down = (q) => {
    const s = sky.bodies();
    const b = isDay(sky.tau) ? [s.sx, s.sy] : [s.mx, s.my];
    if (q[1] >= hz - 0.01 && Math.hypot(q[0] - b[0], q[1] - b[1]) > 0.12) return false;
    held = true;
    armed = q[1] < hz - 0.02;
    place(q);
    return true;
  };
  sky.move = (q) => {
    if (!held) return false;
    const b = isDay(sky.tau) ? SUN : MOON;
    if (q[1] > hz + b.dy + 0.02 && armed) setBody(q);
    else { if (q[1] < hz - 0.02) armed = true; place(q); }
    return true;
  };
  sky.up = () => { held = false; };
  return sky;
}
