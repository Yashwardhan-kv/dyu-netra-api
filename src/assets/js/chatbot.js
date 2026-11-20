/* Dyunetra Assistant — floating chat widget */
(function () {
  'use strict';

  var API = (document.currentScript && document.currentScript.getAttribute('data-api')) || '';
  if (!API) return;

  var QUICK = [
    'What is MEVONU?',
    'Tell me about QEVRAXIS',
    'What does DevAI do?',
    'How can I contact Dyunetra?'
  ];

  // ---------- state ----------
  var open = false;
  var history = []; // {role, content}
  var busy = false;

  // ---------- build DOM ----------
  var wrap = document.createElement('div');
  wrap.className = 'dyu-bot';
  wrap.innerHTML =
    '<button class="dyu-bot-fab" aria-label="Open Dyunetra Assistant" aria-expanded="false">' +
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8">' +
    '<path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/>' +
    '<circle cx="9.5" cy="12" r="1.2" fill="currentColor" stroke="none"/>' +
    '<circle cx="14.5" cy="12" r="1.2" fill="currentColor" stroke="none"/>' +
    '</svg>' +
    '<span class="dyu-bot-badge">1</span>' +
    '</button>' +
    '<section class="dyu-bot-panel" role="dialog" aria-label="Dyunetra Assistant">' +
    '<header class="dyu-bot-head">' +
    '<img src="assets/img/logo.webp" alt="" width="30" height="30">' +
    '<div><b>Dyunetra Assistant</b><small>Online · answers in seconds</small></div>' +
    '<button class="dyu-bot-x" aria-label="Close">&times;</button>' +
    '</header>' +
    '<div class="dyu-bot-log" aria-live="polite"></div>' +
    '<div class="dyu-bot-quick"></div>' +
    '<form class="dyu-bot-form">' +
    '<input type="text" placeholder="Ask about MEVONU, QEVRAXIS, DevAI…" maxlength="600" autocomplete="off" aria-label="Your message">' +
    '<button type="submit" aria-label="Send">' +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
    '</button>' +
    '</form>' +
    '<footer class="dyu-bot-foot">Powered by Dyunetra · <a href="contact.html">Contact us</a></footer>' +
    '</section>';
  document.body.appendChild(wrap);

  var fab = wrap.querySelector('.dyu-bot-fab');
  var panel = wrap.querySelector('.dyu-bot-panel');
  var log = wrap.querySelector('.dyu-bot-log');
  var quick = wrap.querySelector('.dyu-bot-quick');
  var form = wrap.querySelector('.dyu-bot-form');
  var input = form.querySelector('input');
  var badge = wrap.querySelector('.dyu-bot-badge');

  // ---------- helpers ----------
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // allow only bold/italic/[text](url); everything else escaped
  function fmt(s) {
    var t = esc(s);
    t = t.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    t = t.replace(/\*([^*]+)\*/g, '<i>$1</i>');
    t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|[^)\s]+\.html)\)/g, function (_, label, href) {
            var safeHref = /^(https?:\/\/|mailto:|[^)"'\s]+\.html$)/.test(href) ? href : '#';
            return '<a href="' + esc(href) + '"' + (href.indexOf('mailto:') === 0 ? '' : ' target="_blank" rel="noopener noreferrer"') + '>' + label + '</a>';
    });
    return t;
  }

  function bubble(role, html) {
    var div = document.createElement('div');
    div.className = 'dyu-msg ' + (role === 'user' ? 'dyu-user' : 'dyu-bot-msg');
    div.innerHTML = html;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function typing() {
    return bubble('bot', '<span class="dyu-dot"></span><span class="dyu-dot"></span><span class="dyu-dot"></span>');
  }

  function greet() {
    bubble('bot', 'Hi! I\'m the <b>Dyunetra Assistant</b>. Ask me about our products (MEVONU, QEVRAXIS, DevAI), services, or how to get in touch.');
    QUICK.forEach(function (q) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dyu-q';
      b.textContent = q;
      b.addEventListener('click', function () { ask(q); });
      quick.appendChild(b);
    });
  }

  function ask(text) {
    if (busy || !text.trim()) return;
    history.push({ role: 'user', content: text.trim().slice(0, 600) });
    bubble('user', fmt(text));
    input.value = '';
    busy = true;
    var t = typing();

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        if (x.ok && x.j.reply) {
          history.push({ role: 'assistant', content: x.j.reply });
          t.innerHTML = fmt(x.j.reply);
        } else {
          t.innerHTML = 'Sorry — I couldn\'t answer that right now. Try the <a href="contact.html">Contact page</a>.';
        }
      })
      .catch(function () {
        t.innerHTML = 'Network hiccup — please try again.';
      })
      .then(function () {
        busy = false;
        log.scrollTop = log.scrollHeight;
      });
  }

  // ---------- events (click-to-open only — never auto-opens) ----------
  var greeted = false;
  function setOpen(o) {
    open = o;
    panel.hidden = !o;
    panel.classList.toggle('open', o);
    fab.setAttribute('aria-expanded', o);
    fab.classList.toggle('on', o);
    if (o) { if (!greeted) { greet(); greeted = true; } badge.style.display = 'none'; setTimeout(function(){ input.focus(); }, 100); }
  }
  fab.addEventListener('click', function () { setOpen(!open); });

  wrap.querySelector('.dyu-bot-x').addEventListener('click', function (e) { e.stopPropagation(); setOpen(false); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ask(input.value);
  });
})();
