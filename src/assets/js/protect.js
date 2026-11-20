/* Dyunetra — content protection layer (deterrents, not DRM) */
(function () {
  'use strict';

  function msg(text) {
    var t = document.getElementById('prot-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'prot-toast';
      t.style.cssText = 'position:fixed;bottom:26px;left:50%;transform:translateX(-50%) translateY(20px);z-index:9999;background:rgba(5,17,24,.95);border:1px solid rgba(111,243,255,.5);color:#6ff3ff;font:600 13px/1.4 monospace,monospace;letter-spacing:.08em;padding:10px 18px;border-radius:8px;opacity:0;transition:opacity .3s,transform .3s;pointer-events:none;text-transform:uppercase;box-shadow:0 0 24px rgba(111,243,255,.2)';
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(20px)'; }, 2200);
  }

  // Disable right-click context menu on protected assets
  document.addEventListener('contextmenu', function (e) {
    if (e.target.closest && e.target.closest('img')) {
      e.preventDefault();
      msg('© Dyunetra — image use restricted');
    }
  });

  // Block drag of images
  ['dragstart'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      if (e.target.nodeName === 'IMG') { e.preventDefault(); msg('© Dyunetra — content protected'); }
    });
  });

  // Block copy of page text with notice (keep copy allowed inside form inputs)
  document.addEventListener('copy', function (e) {
    var sel = window.getSelection ? String(window.getSelection()) : '';
    if (sel.length > 40 && !(e.target.closest && e.target.closest('input,textarea'))) {
      e.clipboardData.setData('text/plain', '© Dyunetra — ' + sel.slice(0, 160) + '…\nSource: dyunetra.dpdns.org');
      e.preventDefault();
      msg('Copied with attribution');
    }
  });

  // Print deterrent lives in style.css (CSP forbids inline <style> injection)

  // Ctrl/Cmd+P deterrent + PrintScreen deterrence via blur
  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    if (k === 'printscreen') { msg('Screenshot detected — content © Dyunetra'); }
    if ((e.ctrlKey || e.metaKey) && (k === 's')) {
      e.preventDefault(); msg('Saving is disabled');
    }
  });

  // Watermark: footer brand only (no image watermarks elsewhere)
  var foot = document.querySelector('footer .brand');
  if (foot) foot.classList.add('wm');
})();
