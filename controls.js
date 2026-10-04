/*
 * controls.js — shared touch/mobile support for the experiment control panels.
 *
 * - Adds a tappable button to show/hide the panel (H still works on desktop).
 * - On phones the panel starts hidden and opens as a bottom sheet, so the
 *   canvas is visible on load.
 * - Hides the keyboard/mouse hint pill on phones.
 * - Gives sliders room so the 22px thumb no longer covers its label.
 * - On the WebGPU pieces (the ones with a #nogpu message): while a piece
 *   starts up where it can run, a loader, terminal style: how far along it
 *   is as a percentage, and "loading..." typed out, until its first frame is
 *   on screen. Where it can't run, no spinner: iPhone and iPad below iOS 27
 *   hear that it needs 27, and a browser without WebGPU gets a cheeky line
 *   and what to try instead. On the gallery, shows its #ios-note.
 *
 * Include with <script src="controls.js" defer></script>. Pages without a
 * panel still get the slider spacing fix.
 */
(function () {
  'use strict';

  var MOBILE = '(max-width: 700px), (pointer: coarse)';

  var css = [
    '.panel input[type=range],.control-group input[type=range],.controls input[type=range]{margin:8px 0 2px}',
    '.vx-toggle{display:none;position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:20;',
    'width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,0.12);',
    'background:rgba(10,10,12,0.85);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);',
    'color:#ccc;cursor:pointer;align-items:center;justify-content:center;padding:0;-webkit-tap-highlight-color:transparent}',
    '.vx-toggle svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}',
    '.vx-toggle[aria-expanded=true]{background:#fff;color:#000;border-color:#fff}',
    '@media ' + MOBILE + '{',
    '  .vx-toggle{display:flex}',
    '  html.vx-has-panel .hint-pill,html.vx-has-panel .hint,html.vx-has-panel #hint{display:none}',
    '}',
    '@media (max-width: 700px){',
    '  .panel.vx-panel{left:12px;right:12px;width:auto;bottom:calc(72px + env(safe-area-inset-bottom));',
    '    max-height:calc(100dvh - 140px)}',
    '  .panel.vx-panel.hidden{transform:translateY(calc(100% + 100px))}',
    '  #attractor-ui.vx-panel{right:12px;width:auto;max-height:calc(100dvh - 100px)}',
    '  #attractor-ui.vx-panel .attractor-panel{width:auto}',
    '}',
    '.vx-ios-note{position:fixed;left:50%;top:calc(14px + env(safe-area-inset-top));transform:translateX(-50%);z-index:30;',
    'display:flex;align-items:flex-start;gap:10px;width:max-content;max-width:min(440px,calc(100vw - 120px));padding:9px 10px 9px 14px;',
    'border:1px solid rgba(255,255,255,0.12);border-radius:10px;background:rgba(10,10,12,0.85);',
    '-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);',
    "font-family:'Space Mono',ui-monospace,monospace;font-size:11px;line-height:1.5;letter-spacing:.3px;color:#bbb}",
    '.vx-ios-note button{flex:none;border:0;background:none;color:#777;font-size:15px;line-height:1;padding:1px 2px;cursor:pointer;',
    '-webkit-tap-highlight-color:transparent}',
    '.nogpu.on~.vx-ios-note{display:none}',
    '.nogpu{flex-direction:column}',
    '.nogpu .vx-lead{display:block;color:#aaa;margin-bottom:6px}',
    ".vx-spin{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:25;pointer-events:none;display:flex;gap:.8em;",
    "white-space:pre;font:15px/1 'Share Tech Mono','Space Mono',ui-monospace,monospace;letter-spacing:.06em;color:#dca56e;",
    'opacity:0;transition:opacity .45s ease;text-shadow:0 0 6px rgba(220,165,110,.7),0 0 18px rgba(220,165,110,.3)}',
    '.vx-spin .p{width:4ch;text-align:right}',
    '.vx-spin .t{width:12ch}',
    '.vx-spin.in{opacity:1}'
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Who's looking. (iPads ask for desktop sites as a Mac, so a Mac with a
  // touch screen is an iPad.)
  var UA = navigator.userAgent;
  var IPAD = /iPad/.test(UA) || (/Macintosh/.test(UA) && navigator.maxTouchPoints > 1);
  var IOS = IPAD || /iP(hone|od)/.test(UA);
  var ANDROID = /Android/.test(UA);

  // iPhone and iPad, short of iOS 27, where the WebGPU pieces don't run yet.
  // Safari gives its version (the OS version in its user agent has stood at
  // 18.6 since iOS 26); other iOS browsers don't, so they hear about it too
  // unless they say they're on 27 or later.
  function iosBelow27() {
    if (!IOS) return false;
    var v = UA.match(/Version\/(\d+)/) || UA.match(/OS (\d+)_\d+/);
    return !(v && +v[1] >= 27);
  }

  // What to say where a piece can't run: a cheeky line, picked afresh each
  // visit, then what to do about it.
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cheek() {
    if (IOS) {
      var dev = IPAD ? 'iPad' : 'iPhone', os = IPAD ? 'iPadOS' : 'iOS';
      return [pick(['Nice ' + dev + '. Shame about the ' + os + '.',
                    'Your ' + dev + '\u2019s a few updates behind.',
                    'This one\u2019s a little ahead of your ' + dev + '.']),
              'It needs ' + os + ' 27 or later.'];
    }
    return [pick(['Have you tried not using a potato?',
                  'It\u2019s not you, it\u2019s your browser.',
                  'This browser brought a crayon to a GPU fight.']),
            ANDROID ? 'This one runs on WebGPU. Open it in a recent Chrome.'
                    : 'This one runs on WebGPU. Try a recent Chrome or Edge.'];
  }

  // The page's full-screen message, shown where WebGPU is missing altogether.
  function setNoGpu(nogpu, msg) {
    nogpu.textContent = '';
    var lead = document.createElement('span');
    lead.className = 'vx-lead';
    lead.textContent = msg[0];
    nogpu.appendChild(lead);
    nogpu.appendChild(document.createTextNode(msg[1]));
  }

  // On iPhone and iPad below 27, a small note at the top that can be put away.
  function iosNote(msg) {
    var note = document.createElement('div');
    note.className = 'vx-ios-note';
    note.setAttribute('role', 'note');
    note.innerHTML = '<span></span><button type="button" aria-label="Dismiss">\u00d7</button>';
    note.firstChild.textContent = msg[0] + ' ' + msg[1];
    note.lastChild.addEventListener('click', function () { note.parentNode.removeChild(note); });
    document.body.appendChild(note);
  }

  // The loader, terminal style: on the left how far along the piece is with
  // starting up, and beside it "loading..." typed out the way a terminal
  // would: each letter flickers through the home page hero's ASCII ramp
  // before it lands, the dots count up behind a blinking cursor, and now and
  // then a letter glitches and lands again. The percentage moves on at each
  // real step of the start (step(v, c, tau): it's at v and creeps toward c,
  // half way there after tau, until the next), so it never sits still, and
  // reads 100% only once the first frame is on screen. The creep slows as it
  // goes but never stops, so a long wait on a slow phone keeps ticking over
  // rather than sitting at 99. (The line is a fixed width, so nothing shifts.)
  var RAMP = ' .,:;i1tfLCG08@';
  var NOISE = RAMP.slice(1) + '#$%&*+=<>/\\|?';
  var WORD = 'loading';
  function loader() {
    var el = document.createElement('div');
    el.className = 'vx-spin';
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', 'Loading');
    el.innerHTML = '<span class="p"></span><span class="t"></span>';
    var pct = el.firstChild, text = el.lastChild;
    document.body.appendChild(el);
    var font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap';
    document.head.appendChild(font);
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var t0 = Date.now(), timer = 0, gone = false;
    var glitchAt = 2600 + Math.random() * 1500, glitched = -1;
    var typed = 160 + WORD.length * 70;
    var base = 2, ceil = 9, tau = 1500, since = t0, shown = 0, full = false;
    function noise() { return NOISE.charAt(Math.floor(Math.random() * NOISE.length)); }
    function draw() {
      var now = Date.now(), ms = now - t0;
      var dt = now - since;
      shown = Math.max(shown, base + (ceil - base) * dt / (dt + tau));
      pct.textContent = (full ? 100 : Math.min(99, Math.floor(shown))) + '%';
      if (still) { text.textContent = WORD + '..._'; return; }
      if (ms > glitchAt) {
        if (glitched < 0) glitched = Math.floor(Math.random() * WORD.length);
        if (ms > glitchAt + 140) { glitched = -1; glitchAt = ms + 2200 + Math.random() * 2400; }
      }
      var s = '';
      for (var k = 0; k < WORD.length; k++) s += ms < 160 + k * 70 || k === glitched ? noise() : WORD.charAt(k);
      if (ms >= typed) s += '...'.slice(0, Math.floor((ms - typed) / 380) % 4);
      text.textContent = s + (Math.floor(ms / 530) % 2 ? ' ' : '_');
    }
    draw();
    timer = setInterval(draw, 50);
    // (A beat before it shows, so a quick start never flashes it.)
    var show = setTimeout(function () { el.classList.add('in'); }, 120);
    function stop() {
      if (gone) return;
      gone = true;
      clearInterval(timer);
      clearTimeout(show);
      el.classList.remove('in');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 500);
    }
    return {
      step: function (v, c, t) { if (v > base) { base = v; ceil = c; tau = t || 1200; since = Date.now(); draw(); } },
      at: function () { return base; },
      // On screen: 100% for a moment, then away.
      done: function () { full = true; draw(); setTimeout(stop, 260); },
      stop: stop
    };
  }

  // A WebGPU piece starting up: the loader until the first frame is on
  // screen, where the piece can run; the message where it can't, or where
  // it fails to start.
  function startUp(nogpu) {
    var msg = cheek();
    setNoGpu(nogpu, msg);
    if (iosBelow27()) { iosNote(msg); return; }
    if (!navigator.gpu) return;
    var L = loader();
    var undo = [], done = false;
    // While the page's code and fonts are still coming down, each file that
    // finishes is a small step, up to 9%; the code is in once it asks for
    // the GPU.
    try {
      var files = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function () { if (L.at() < 9) L.step(Math.min(9, L.at() + 2), 9, 1500); });
      });
      files.observe({ type: 'resource' });
      undo.push(function () { files.disconnect(); });
    } catch (e) {}
    function finish(ok) {
      if (done) return;
      done = true;
      undo.forEach(function (f) { f(); });
      if (ok) L.done(); else L.stop();
      window.removeEventListener('error', failed);
      window.removeEventListener('unhandledrejection', failed);
    }
    // Each real step of a WebGPU start moves the percentage on: the adapter,
    // the device, the shader handed to the compiler, the pipeline built, the
    // first frame sent. The longest wait is usually the last, while the GPU
    // compiles and draws, so from there it climbs slowest.
    function onStep(proto, name, v, c) {
      if (!proto || typeof proto[name] !== 'function') return;
      var orig = proto[name];
      proto[name] = function () {
        var r = orig.apply(this, arguments);
        if (r && typeof r.then === 'function') r.then(function () { L.step(v, c); }, function () {});
        else L.step(v, c);
        return r;
      };
      undo.push(function () { proto[name] = orig; });
    }
    onStep(window.GPU && GPU.prototype, 'requestAdapter', 10, 18);
    onStep(window.GPUAdapter && GPUAdapter.prototype, 'requestDevice', 20, 28);
    onStep(window.GPUDevice && GPUDevice.prototype, 'createShaderModule', 30, 45);
    onStep(window.GPUDevice && GPUDevice.prototype, 'createRenderPipeline', 50, 58);
    onStep(window.GPUDevice && GPUDevice.prototype, 'createRenderPipelineAsync', 50, 58);
    // The first frame: the first work handed to the GPU, once it's done.
    var Q = window.GPUQueue && GPUQueue.prototype;
    if (Q && Q.submit) {
      var submit = Q.submit;
      Q.submit = function () {
        Q.submit = submit;
        L.step(60, 99, 2500);
        var r = submit.apply(this, arguments);
        this.onSubmittedWorkDone().then(function () {
          requestAnimationFrame(function () { requestAnimationFrame(function () { finish(true); }); });
        }, function () { finish(false); });
        return r;
      };
      undo.push(function () { Q.submit = submit; });
    }
    // The page gives up (it shows its message), or the GPU does before the
    // first frame: then the message, and no loader.
    new MutationObserver(function () { if (nogpu.classList.contains('on')) finish(false); })
      .observe(nogpu, { attributes: true, attributeFilter: ['class'] });
    function failed(e) {
      var r = e.reason || e.error || e;
      if (!/gpu|wgsl|shader/i.test(String((r && (r.message || r.code)) || e.message || '')) && !/vgpu/.test(String(e.filename || ''))) return;
      finish(false);
      nogpu.classList.add('on');
      ['panel', 'hintPill'].forEach(function (id) { var x = document.getElementById(id); if (x) x.style.display = 'none'; });
      var t = document.querySelector('.vx-toggle');
      if (t) t.parentNode.removeChild(t);
    }
    window.addEventListener('error', failed);
    window.addEventListener('unhandledrejection', failed);
    // (Never load for ever.)
    setTimeout(function () { finish(false); }, 30000);
  }

  function init() {
    var nogpu = document.getElementById('nogpu');
    if (nogpu) startUp(nogpu);
    var gallery = document.getElementById('ios-note');
    if (gallery && iosBelow27()) gallery.hidden = false;
    var panel = document.getElementById('panel') || document.getElementById('attractor-ui');
    if (!panel) return;

    document.documentElement.classList.add('vx-has-panel');
    panel.classList.add('vx-panel');
    if (window.matchMedia('(max-width: 700px)').matches) panel.classList.add('hidden');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'vx-toggle';
    btn.setAttribute('aria-label', 'Toggle controls');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/>' +
      '<circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>';
    document.body.appendChild(btn);

    function sync() {
      btn.setAttribute('aria-expanded', String(!panel.classList.contains('hidden')));
    }
    btn.addEventListener('click', function () {
      panel.classList.toggle('hidden');
    });
    // The H key toggles the same class, so observe it to keep the button in step.
    new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ['class'] });
    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
