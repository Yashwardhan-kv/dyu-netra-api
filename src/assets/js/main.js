/* DYUNETRA — interface behaviour */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  root.classList.remove('nojs');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  /* boot loader (once per tab session) */
  var boot = $('.boot'), seen = false;
  try { seen = sessionStorage.getItem('dy_boot') === '1'; } catch (e) {}
  if (boot) {
    if (seen || reduce) { boot.classList.add('done'); }
    else {
      var bar = $('.boot-bar i', boot), msg = $('.boot-msg', boot), n = 0;
      var lines = ['Initializing core', 'Calibrating sensors', 'Securing channel', 'Systems online'];
      var iv = setInterval(function () {
        n++; if (bar) bar.style.width = Math.min(100, n * 25) + '%';
        if (msg) msg.textContent = lines[Math.min(n - 1, lines.length - 1)];
        if (n >= 4) {
          clearInterval(iv);
          setTimeout(function () { boot.classList.add('done'); }, 250);
          try { sessionStorage.setItem('dy_boot', '1'); } catch (e) {}
        }
      }, 260);
    }
  }

  /* nav */
  var nav = $('.nav'), burger = $('.burger'), menu = $('.menu');
  function onScroll() { if (nav) nav.classList.toggle('stuck', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }); });
  }

  /* reveal on scroll */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) {
      var dl = el.getAttribute('data-d'); if (dl) el.style.transitionDelay = (parseInt(dl, 10) * 90) + 'ms';
      io.observe(el);
    });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* count-up */
  $$('[data-count]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10), suffix = el.getAttribute('data-suffix') || '', done = false;
    function run() {
      if (done) return; done = true;
      if (reduce) { el.textContent = target + suffix; return; }
      var t0 = performance.now();
      (function step(t) {
        var p = Math.min(1, (t - t0) / 1400), v = Math.round(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = v + suffix; if (p < 1) requestAnimationFrame(step);
      })(t0);
    }
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { run(); o.disconnect(); } }); o.observe(el);
    } else run();
  });

  /* typed line */
  var tl = $('[data-type]');
  if (tl) {
    var words = tl.getAttribute('data-type').split('|'), wi = 0, ci = 0, del = false;
    if (reduce) { tl.textContent = words[0]; }
    else (function tick() {
      var w = words[wi];
      if (!del) { ci++; if (ci >= w.length) { del = true; tl.textContent = w; return void setTimeout(tick, 1900); } }
      else { ci--; if (ci <= 0) { del = false; wi = (wi + 1) % words.length; } }
      tl.textContent = w.slice(0, ci);
      setTimeout(tick, del ? 28 : 55);
    })();
  }

  /* glitch headline */
  $$('.glitch').forEach(function (g) {
    if (reduce) return;
    setInterval(function () { g.classList.add('hit'); setTimeout(function () { g.classList.remove('hit'); }, 360); }, 5200);
  });

  /* 3D tilt on cards (fine pointers only) */
  var fine = window.matchMedia && matchMedia('(pointer:fine)').matches;
  if (fine && !reduce) {
    $$('.tilt').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = 'perspective(900px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg) translateZ(0)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    var em = $('.emblem-in'), emw = $('.emblem');
    if (em && emw) {
      emw.addEventListener('pointermove', function (e) {
        var r = emw.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        em.style.transform = 'rotateY(' + (x * 26) + 'deg) rotateX(' + (-y * 26) + 'deg)';
      });
      emw.addEventListener('pointerleave', function () { em.style.transform = ''; });
    }
    var gc = $('.glow-cursor');
    if (gc) {
      window.addEventListener('pointermove', function (e) { gc.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)'; gc.classList.add('on'); }, { passive: true });
    }
  }

  /* blog filter */
  var fb = $$('.filters button');
  if (fb.length) {
    fb.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        fb.forEach(function (x) { x.classList.toggle('on', x === b); });
        $$('.post').forEach(function (p) { p.hidden = !(f === 'all' || p.getAttribute('data-c') === f); });
      });
    });
  }

  /* contact form — stores in Supabase (workers migration) */
  var form = $('#contact-form');
  if (form) {
    var st = $('.status', form), tsField = $('[name=ts]', form);
    tsField.value = String(Date.now()); // load-time timestamp for spam heuristic
    var qs = new URLSearchParams(location.search);
    if (qs.get('sent') === '1' && st) { st.className = 'status ok'; st.textContent = '// Message transmitted. We will respond shortly.'; }
    var sel = $('[name=interest]', form), want = qs.get('i');
    if (sel && want) { $$('option', sel).forEach(function (o) { if (o.value === want) sel.value = want; }); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = $('button[type=submit]', form); btn.disabled = true;
      st.className = 'status'; st.textContent = '// Transmitting…';
      // client-side sanity (honeypot + min time-on-page 3s)
      var hp = $('#website').value.trim();
      var elapsed = Date.now() - parseInt(tsField.value, 10);
      if (hp) {
        st.className = 'status ok'; st.textContent = '// Message transmitted. We will respond shortly.'; // silently drop bots
        btn.disabled = false;
        return;
      }
      if (elapsed < 3000) {
        st.className = 'status err'; st.textContent = '// Please wait a moment before sending.';
        btn.disabled = false;
        return;
      }
      var payload = {
        name: $('#name').value.trim(),
        email: $('#email').value.trim(),
        organisation: $('#org').value.trim(),
        interest: $('#interest').value,
        message: $('#message').value.trim(),
        website: hp,
        ts: tsField.value
      };
      if (!payload.name || !payload.email || !payload.message) {
        st.className = 'status err'; st.textContent = '// Name, email and message are required.'; btn.disabled = false; return;
      }
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (data) {
            if (!r.ok || !data.ok) throw new Error(data.error || 'Transmission failed.');
            return data;
          });
        })
        .then(function (data) {
          form.reset();
          tsField.value = String(Date.now());
          if (data.emailAccepted) {
            st.className = 'status ok'; st.textContent = '// Message received. Email notification request accepted.';
          } else {
            st.className = 'status err'; st.textContent = '// Message stored, but email notification could not be queued. Please email founder@dyunetra.dpdns.org.';
          }
        })
        .catch(function (error) {
          st.className = 'status err';
          st.textContent = '// ' + (error.message || 'Transmission failed. Please email founder@dyunetra.dpdns.org.');
        })
        .then(function () { btn.disabled = false; });
    });
  }

  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* scroll progress bar */
  var prog = $('.scroll-progress');
  function updProg() {
    if (!prog) return;
    var h = d.documentElement.scrollHeight - window.innerHeight;
    prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
  }
  window.addEventListener('scroll', updProg, { passive: true }); updProg();

  /* hero parallax drift + fade */
  var hero = $('.hero'), heroCopy = hero && $('.hero-copy', hero);
  if (hero && heroCopy && !reduce) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroCopy.style.transform = 'translateY(' + (y * 0.18) + 'px)';
        heroCopy.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.85)));
      }
    }, { passive: true });
  }

  /* spotlight follow on panels */
  $$('.panel').forEach(function (p) {
    if (!$('.spot', p)) { var s = d.createElement('i'); s.className = 'spot'; p.appendChild(s); }
    p.addEventListener('pointermove', function (e) {
      var r = p.getBoundingClientRect();
      p.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      p.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* magnetic buttons (fine pointer only) */
  if (fine && !reduce) {
    $$('.btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        b.style.transform = 'translate(' + (x * 10) + 'px,' + (y * 8) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* timeline markers pop in */
  $$('.tl li').forEach(function (li) {
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { li.classList.add('in-view'); o.disconnect(); } }, { threshold: .4 });
      o.observe(li);
    } else li.classList.add('in-view');
  });

  /* stats bar grow */
  var statsRow = $('.stats');
  if (statsRow && 'IntersectionObserver' in window) {
    var os = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { statsRow.classList.add('in'); os.disconnect(); } }, { threshold: .3 });
    os.observe(statsRow);
  }
})();
