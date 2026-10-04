/*
 * controls.js — shared touch/mobile support for the experiment control panels.
 *
 * - Adds a tappable button to show/hide the panel (H still works on desktop).
 * - On phones the panel starts hidden and opens as a bottom sheet, so the
 *   canvas is visible on load.
 * - Hides the keyboard/mouse hint pill on phones.
 * - Gives sliders room so the 22px thumb no longer covers its label.
 * - On the WebGPU pieces (the ones with a #nogpu message): while a piece
 *   starts up where it can run, a spinner, one glyph breathing up the ASCII
 *   ramp from the home page's hero and back, until its first frame is on
 *   screen. Where it can't run, no spinner: iPhone and iPad below iOS 27
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
    ".vx-spin{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:25;pointer-events:none;width:1ch;text-align:center;",
    "font:26px/1 'Share Tech Mono','Space Mono',ui-monospace,monospace;color:#dca56e;opacity:0;transition:opacity .45s ease;",
    'text-shadow:0 0 6px rgba(220,165,110,.7),0 0 18px rgba(220,165,110,.3)}',
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

  // The spinner: one glyph breathing up the hero's ramp and back.
  var RAMP = ' .,:;i1tfLCG08@';
  var SEQ = RAMP.slice(1) + RAMP.slice(2, -1).split('').reverse().join('');
  function spinner() {
    var el = document.createElement('div');
    el.className = 'vx-spin';
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', 'Loading');
    el.textContent = SEQ[0];
    document.body.appendChild(el);
    var font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap';
    document.head.appendChild(font);
    var i = 0, timer = 0;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) el.textContent = 'G';
    else timer = setInterval(function () { i = (i + 1) % SEQ.length; el.textContent = SEQ[i]; }, 77);
    // (A beat before it shows, so a quick start never flashes it.)
    var show = setTimeout(function () { el.classList.add('in'); }, 120);
    return function stop() {
      clearInterval(timer);
      clearTimeout(show);
      el.classList.remove('in');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 500);
    };
  }

  // A WebGPU piece starting up: the spinner until the first frame is on
  // screen, where the piece can run; the message where it can't, or where
  // it fails to start.
  function startUp(nogpu) {
    var msg = cheek();
    setNoGpu(nogpu, msg);
    if (iosBelow27()) { iosNote(msg); return; }
    if (!navigator.gpu) return;
    var stop = spinner();
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      stop();
      window.removeEventListener('error', failed);
      window.removeEventListener('unhandledrejection', failed);
    }
    // The first frame: the first work handed to the GPU, once it's done.
    var Q = window.GPUQueue && GPUQueue.prototype;
    if (Q && Q.submit) {
      var submit = Q.submit;
      Q.submit = function () {
        Q.submit = submit;
        var r = submit.apply(this, arguments);
        this.onSubmittedWorkDone().then(function () {
          requestAnimationFrame(function () { requestAnimationFrame(finish); });
        }, finish);
        return r;
      };
    }
    // The page gives up (it shows its message), or the GPU does before the
    // first frame: then the message, and no spinner.
    new MutationObserver(function () { if (nogpu.classList.contains('on')) finish(); })
      .observe(nogpu, { attributes: true, attributeFilter: ['class'] });
    function failed(e) {
      var r = e.reason || e.error || e;
      if (!/gpu|wgsl|shader/i.test(String((r && (r.message || r.code)) || e.message || '')) && !/vgpu/.test(String(e.filename || ''))) return;
      finish();
      nogpu.classList.add('on');
      ['panel', 'hintPill'].forEach(function (id) { var x = document.getElementById(id); if (x) x.style.display = 'none'; });
      var t = document.querySelector('.vx-toggle');
      if (t) t.parentNode.removeChild(t);
    }
    window.addEventListener('error', failed);
    window.addEventListener('unhandledrejection', failed);
    // (Never spin for ever.)
    setTimeout(finish, 30000);
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
