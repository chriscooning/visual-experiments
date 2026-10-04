/*
 * controls.js — shared touch/mobile support for the experiment control panels.
 *
 * - Adds a tappable button to show/hide the panel (H still works on desktop).
 * - On phones the panel starts hidden and opens as a bottom sheet, so the
 *   canvas is visible on load.
 * - Hides the keyboard/mouse hint pill on phones.
 * - Gives sliders room so the 22px thumb no longer covers its label.
 * - On the WebGPU pieces (the ones with a #nogpu message), tells iPhone and
 *   iPad visitors below iOS 27 that the piece uses experimental web features
 *   and needs iOS 27 or later there; on the gallery, shows its #ios-note.
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
    '.nogpu.on~.vx-ios-note{display:none}'
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // iPhone and iPad, short of iOS 27, where the WebGPU pieces don't run yet.
  // Safari gives its version (the OS version in its user agent has stood at
  // 18.6 since iOS 26); other iOS browsers don't, so they hear about it too
  // unless they say they're on 27 or later. (iPads ask for desktop sites as a
  // Mac, so a Mac with a touch screen is an iPad.)
  function iosBelow27() {
    var ua = navigator.userAgent;
    var ios = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    if (!ios) return false;
    var v = ua.match(/Version\/(\d+)/) || ua.match(/OS (\d+)_\d+/);
    return !(v && +v[1] >= 27);
  }

  function iosNote() {
    var nogpu = document.getElementById('nogpu');
    var gallery = document.getElementById('ios-note');
    if ((!nogpu && !gallery) || !iosBelow27()) return;
    if (gallery) { gallery.hidden = false; return; }
    var msg = 'Uses experimental web features. On iPhone and iPad it needs iOS 27 or later.';
    // Where WebGPU is missing altogether, say the same.
    nogpu.textContent = msg;
    var note = document.createElement('div');
    note.className = 'vx-ios-note';
    note.setAttribute('role', 'note');
    note.innerHTML = '<span></span><button type="button" aria-label="Dismiss">\u00d7</button>';
    note.firstChild.textContent = msg;
    note.lastChild.addEventListener('click', function () { note.parentNode.removeChild(note); });
    document.body.appendChild(note);
  }

  function init() {
    iosNote();
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
