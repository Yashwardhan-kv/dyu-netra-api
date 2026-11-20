/*
 * Dyunetra Assistant — front-end chat widget (no dependencies).
 *
 * Add before </body> on every page:
 *   <link rel="stylesheet" href="/chatbot.css">
 *   <script src="/chatbot.js" data-api="https://YOUR-WORKER.workers.dev" defer></script>
 *
 * Optional: data-contact="/contact.html"
 */
(function () {
  'use strict';

  var script = document.currentScript;
  var API_URL = (script && script.getAttribute('data-api')) || '';
  var CONTACT_URL = (script && script.getAttribute('data-contact')) || '/contact.html';
  var STORAGE_KEY = 'dyunetra_chat_v1';
  var MAX_INPUT = 500;
  var MAX_HISTORY = 10;

  // Instant answers for the quick-reply chips (no API call needed).
  // Keep these in sync with the knowledge text in worker.js.
  var QUICK = [
    {
      label: 'What does Dyunetra do?',
      answer:
        'Dyunetra is a technology company building **cybersecurity, blockchain and AI products**, and advising organisations on IT that holds up under pressure.\n\nIt works across four areas: Cybersecurity, Blockchain, Artificial Intelligence and IT Consulting. See the [Services page](/services.html) for details.'
    },
    {
      label: 'MEVONU',
      answer:
        '**MEVONU** is Dyunetra\'s Open DFIR Intelligence Platform: an offline-first, AI-assisted digital investigation platform. Every investigative action is cryptographically attributable, and every finding carries a human-readable rationale.\n\nTagline: *Evidence. Intelligence. Integrity.* More on the [Services page](/services.html#mevonu).'
    },
    {
      label: 'QEVRAXIS',
      answer:
        '**QEVRAXIS** is a deep-learning network security framework that detects, analyses and responds to cyber threats in real time, with a centralised dashboard for actionable insight.\n\nMore on the [Services page](/services.html#qevraxis).'
    },
    {
      label: 'DevAI',
      answer:
        '**DevAI** is Dyunetra\'s secure AI workforce platform: governed AI employees that automate research, reporting and coding support, with approved access, human oversight and auditable execution. It is not an uncontrolled chatbot.\n\nMore on the [Services page](/services.html#devai).'
    },
    {
      label: 'Who founded Dyunetra?',
      answer:
        'Dyunetra was founded by **Yashwardhan Katkamwar**. It began as the name of an engineering student team from Bajaj Institute of Technology, which won the grand prize (Software Edition) at Smart India Hackathon 2022.\n\nRead more on the [About page](/about.html#founder).'
    },
    {
      label: 'Contact the team',
      answer:
        'You can reach the Dyunetra team through the [Contact page](' + CONTACT_URL + '). Tell them what you are protecting, investigating or automating.'
    }
  ];

  var GREETING =
    'Hi, I\'m the **Dyunetra Assistant**. Ask me about our products (MEVONU, QEVRAXIS, DevAI), our services, or the team. I answer from information on this website.';

  var history = []; // {role: 'user'|'assistant', content: string}
  var pending = false;

  // ---------- helpers ----------
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Safe mini-formatter: escapes HTML first, then allows **bold**, *italic*, [text](url), newlines.
  function format(text) {
    var s = String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    s = s.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)"']+)\)/g, function (m, t, u) {
      var external = /^https?:/i.test(u);
      return '<a href="' + u + '"' + (external ? ' target="_blank"' : '') + ' rel="noopener noreferrer">' + t + '</a>';
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    return s.replace(/\n/g, '<br>');
  }

  function save() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-30))); } catch (e) { /* storage unavailable */ }
  }
  function load() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.filter(function (m) {
        return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string';
      });
    } catch (e) { return []; }
  }

  // ---------- build UI ----------
  var root = el('div');
  root.id = 'dyu-chat-root';

  var launcher = el('button', 'dyu-launcher');
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Open Dyunetra Assistant chat');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z"/><circle cx="9" cy="12" r=".6" fill="currentColor"/><circle cx="12.5" cy="12" r=".6" fill="currentColor"/><circle cx="16" cy="12" r=".6" fill="currentColor"/></svg>';

  var panel = el('section', 'dyu-panel');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Dyunetra Assistant');

  var header = el('div', 'dyu-header');
  var title = el('div', 'dyu-title');
  var strong = el('strong', null, 'DYUNETRA ASSISTANT');
  var sub = el('span');
  sub.appendChild(el('i', 'dyu-status'));
  sub.appendChild(document.createTextNode('AI assistant, answers from this site'));
  title.appendChild(strong);
  title.appendChild(sub);

  var contactBtn = el('a', 'dyu-icon-btn', 'Contact');
  contactBtn.href = CONTACT_URL;
  contactBtn.style.width = 'auto';
  contactBtn.style.padding = '0 8px';
  contactBtn.setAttribute('aria-label', 'Contact the Dyunetra team');

  var resetBtn = el('button', 'dyu-icon-btn');
  resetBtn.type = 'button';
  resetBtn.title = 'New conversation';
  resetBtn.setAttribute('aria-label', 'Start a new conversation');
  resetBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>';

  var closeBtn = el('button', 'dyu-icon-btn');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close chat');
  closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  header.appendChild(title);
  header.appendChild(contactBtn);
  header.appendChild(resetBtn);
  header.appendChild(closeBtn);

  var messages = el('div', 'dyu-messages');
  messages.setAttribute('role', 'log');
  messages.setAttribute('aria-live', 'polite');

  var chips = el('div', 'dyu-chips');
  QUICK.forEach(function (q) {
    var c = el('button', 'dyu-chip', q.label);
    c.type = 'button';
    c.addEventListener('click', function () { askQuick(q); });
    chips.appendChild(c);
  });

  var form = el('form', 'dyu-form');
  var input = el('input', 'dyu-input');
  input.type = 'text';
  input.maxLength = MAX_INPUT;
  input.placeholder = 'Ask about Dyunetra…';
  input.setAttribute('aria-label', 'Your message');
  input.autocomplete = 'off';
  var send = el('button', 'dyu-send', 'Send');
  send.type = 'submit';
  form.appendChild(input);
  form.appendChild(send);

  var note = el('div', 'dyu-note', 'AI can make mistakes. For anything important, please contact the team.');

  panel.appendChild(header);
  panel.appendChild(messages);
  panel.appendChild(chips);
  panel.appendChild(form);
  panel.appendChild(note);
  root.appendChild(panel);
  root.appendChild(launcher);

  // ---------- rendering ----------
  function addMessage(role, text) {
    var m = el('div', 'dyu-msg ' + (role === 'user' ? 'dyu-user' : 'dyu-bot'));
    if (role === 'user') m.textContent = text;
    else m.innerHTML = format(text);
    messages.appendChild(m);
    messages.scrollTop = messages.scrollHeight;
    return m;
  }

  function showTyping() {
    var m = el('div', 'dyu-msg dyu-bot');
    var t = el('span', 'dyu-typing');
    t.setAttribute('aria-label', 'Assistant is typing');
    t.innerHTML = '<i></i><i></i><i></i>';
    m.appendChild(t);
    messages.appendChild(m);
    messages.scrollTop = messages.scrollHeight;
    return m;
  }

  function setPending(v) {
    pending = v;
    input.disabled = v;
    send.disabled = v;
  }

  function renderAll() {
    messages.innerHTML = '';
    addMessage('assistant', GREETING);
    history.forEach(function (m) { addMessage(m.role, m.content); });
    chips.style.display = history.length ? 'none' : 'flex';
  }

  // ---------- behaviour ----------
  function askQuick(q) {
    if (pending) return;
    history.push({ role: 'user', content: q.label });
    history.push({ role: 'assistant', content: q.answer });
    save();
    addMessage('user', q.label);
    addMessage('assistant', q.answer);
    chips.style.display = 'none';
  }

  function fallbackMessage(extra) {
    return (extra ? extra + ' ' : '') +
      'Please reach the team through the [Contact page](' + CONTACT_URL + ').';
  }

  function ask(text) {
    if (pending) return;
    text = text.trim().slice(0, MAX_INPUT);
    if (!text) return;

    history.push({ role: 'user', content: text });
    addMessage('user', text);
    chips.style.display = 'none';
    setPending(true);
    var typing = showTyping();

    if (!API_URL) {
      typing.remove();
      var msg0 = fallbackMessage('The assistant is not fully set up yet.');
      history.push({ role: 'assistant', content: msg0 });
      addMessage('assistant', msg0);
      save();
      setPending(false);
      return;
    }

    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 30000);

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-MAX_HISTORY) }),
      signal: controller.signal
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { status: res.status, ok: res.ok, data: data };
        });
      })
      .then(function (r) {
        var reply;
        if (r.ok && r.data && typeof r.data.reply === 'string' && r.data.reply.trim()) {
          reply = r.data.reply.trim();
        } else if (r.status === 429) {
          reply = 'You are sending messages quickly. Please wait a moment and try again.';
        } else {
          reply = fallbackMessage('Sorry, I could not answer that right now.');
        }
        history.push({ role: 'assistant', content: reply });
        typing.remove();
        addMessage('assistant', reply);
      })
      .catch(function () {
        var reply = fallbackMessage('Sorry, I could not reach the assistant.');
        history.push({ role: 'assistant', content: reply });
        typing.remove();
        addMessage('assistant', reply);
      })
      .then(function () {
        clearTimeout(timer);
        save();
        setPending(false);
        input.focus();
      });
  }

  function open() {
    root.classList.add('dyu-open');
    launcher.setAttribute('aria-expanded', 'true');
    launcher.setAttribute('aria-label', 'Close Dyunetra Assistant chat');
    setTimeout(function () { input.focus(); }, 50);
  }
  function close() {
    root.classList.remove('dyu-open');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-label', 'Open Dyunetra Assistant chat');
    launcher.focus();
  }

  launcher.addEventListener('click', function () {
    if (root.classList.contains('dyu-open')) close(); else open();
  });
  closeBtn.addEventListener('click', close);
  resetBtn.addEventListener('click', function () {
    if (pending) return;
    history = [];
    save();
    renderAll();
  });
  panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value;
    input.value = '';
    ask(v);
  });

  function init() {
    history = load();
    renderAll();
    document.body.appendChild(root);
  }
  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
