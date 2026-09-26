/*
 * tilt.js — which way is down, from the phone's motion sensor.
 *
 *   import { tilt } from './lib/tilt.js';
 *   const t = tilt();              // start listening
 *   t.x, t.y                       // gravity in screen space, each -1..1
 *   t.active                       // true once real sensor data has arrived
 *
 * Holding a phone upright gives y ≈ 1 (down the screen); flat on a table
 * gives x ≈ y ≈ 0. iOS only hands out sensor data after a tap asks for it, so
 * the first touch anywhere requests permission. Desktops never report
 * anything, so x and y stay 0 and pages treat tilt as a bonus.
 */
let shared = null;

export function tilt() {
  if (shared) return shared;
  const t = { x: 0, y: 0, active: false };
  shared = t;
  let tx = 0, ty = 0, last = 0;

  function onOrient(e) {
    if (e.beta == null || e.gamma == null) return;
    // beta: front-back tilt, gamma: left-right, both in degrees. Rotate into
    // screen space so tilt follows the picture in landscape too.
    const b = e.beta * Math.PI / 180, g = e.gamma * Math.PI / 180;
    let x = Math.sin(g), y = Math.sin(b);
    const a = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
    if (a === 90) [x, y] = [y, -x];
    else if (a === -90 || a === 270) [x, y] = [-y, x];
    else if (a === 180) [x, y] = [-x, -y];
    tx = Math.max(-1, Math.min(1, x));
    ty = Math.max(-1, Math.min(1, y));
    t.active = true;
  }

  function smooth(now) {
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    const k = 1 - Math.exp(-dt * 6);
    t.x += (tx - t.x) * k;
    t.y += (ty - t.y) * k;
    requestAnimationFrame(smooth);
  }
  requestAnimationFrame(smooth);

  const D = window.DeviceOrientationEvent;
  if (D && typeof D.requestPermission === 'function') {
    const ask = () => {
      D.requestPermission().then((s) => {
        if (s === 'granted') window.addEventListener('deviceorientation', onOrient);
      }).catch(() => {});
      window.removeEventListener('pointerup', ask, true);
    };
    window.addEventListener('pointerup', ask, true);
  } else if (D) {
    window.addEventListener('deviceorientation', onOrient);
  }
  return t;
}
