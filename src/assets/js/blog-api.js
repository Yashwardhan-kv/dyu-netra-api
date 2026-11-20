/* Dyunetra blog — renders posts from Supabase (single source of truth) */
(function () {
  'use strict';
  var SB_URL = 'https://rvppydncsdfyhjiuvart.supabase.co';
  var SB_KEY = 'sb_publishable_fJn13_ySkM8CvvkRwJ2v-A_cqy1vapM';
  var CAT_NAMES = { forensics: 'Forensics', detection: 'Detection', ai: 'AI', cloud: 'Cloud', blockchain: 'Blockchain', consulting: 'Consulting' };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    } catch (e) { return ''; }
  }

  function bodyToHtml(body) {
    return String(body).split(/\n{1,}/).map(function (p) {
      p = p.trim(); return p ? '<p>' + esc(p) + '</p>' : '';
    }).join('');
  }

  function card(post, idx) {
    var cat = (post.category || '').toLowerCase();
    var label = CAT_NAMES[cat] || post.category || 'Note';
    var href = 'post.html?slug=' + encodeURIComponent(post.slug || '');
    return '<details class="panel post rv dyn" data-c="' + esc(cat) + '"' + (idx ? ' data-d="' + idx + '"' : '') + '>' +
      '<summary><span class="meta"><b>' + esc(label) + '</b><span>' + esc(fmtDate(post.published_at)) + '</span><span>' + esc(post.read_time || '3 min read') + '</span></span>' +
      '<h3>' + esc(post.title) + '</h3>' +
      '<span class="ex">' + esc(post.excerpt) + '</span>' +
      '<a class="rd" href="' + href + '" data-link="1">Read article &#8599;</a></summary>' +
      '<div class="body">' + bodyToHtml(post.body) + '</div>' +
      '</details>';
  }

  function render(posts) {
    var grid = document.querySelector('.posts');
    if (!grid) return;
    var note = document.getElementById('posts-note');
    if (!posts.length) {
      grid.innerHTML = '<p class="lead">// No articles published yet. Check back soon.</p>';
      if (note) note.textContent = '';
      return;
    }
    posts.sort(function (a, b) { return new Date(b.published_at) - new Date(a.published_at); });
    grid.innerHTML = posts.map(card).join('');
    if (note) note.textContent = '// Live from the Dyunetra newsroom.';
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
      document.querySelectorAll('.post.dyn.rv').forEach(function (el) {
        var dl = el.getAttribute('data-d');
        if (dl) el.style.transitionDelay = (parseInt(dl, 10) * 90) + 'ms';
        io.observe(el);
      });
    } else {
      document.querySelectorAll('.post.dyn.rv').forEach(function (el) { el.classList.add('in'); });
    }
    grid.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-link]');
      if (a) e.stopPropagation();
    });
  }

  fetch(SB_URL + '/rest/v1/posts?select=slug,title,category,excerpt,body,read_time,published,published_at&published=eq.true&order=published_at.desc&limit=50', {
    headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY }
  })
    .then(function (r) { if (!r.ok) throw new Error('bad status ' + r.status); return r.json(); })
    .then(function (posts) { if (Array.isArray(posts)) render(posts); })
    .catch(function () {
      var grid = document.querySelector('.posts');
      if (grid) grid.innerHTML = '<p class="lead">// Could not load articles right now. Please refresh in a moment.</p>';
      var n = document.getElementById('posts-note'); if (n) n.textContent = '';
    });
})();
