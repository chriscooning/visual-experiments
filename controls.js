/*
 * controls.js — shared touch/mobile support for the experiment control panels.
 *
 * - Adds a tappable button to show/hide the panel (H still works on desktop).
 * - On phones the panel starts hidden and opens as a bottom sheet, so the
 *   canvas is visible on load.
 * - Hides the keyboard/mouse hint pill on phones.
 * - Gives sliders room so the 22px thumb no longer covers its label.
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
    '}'
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function init() {
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
