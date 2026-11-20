/* Dyunetra — renders a single blog post from Supabase by ?slug= */
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

  function slugFromUrl() {
    var qs = new URLSearchParams(location.search);
    var s = (qs.get('slug') || qs.get('id') || '').trim();
    return s.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 120);
  }

  function fail(msg) {
    var t = document.getElementById('post-title');
    if (t) t.textContent = 'Article not found';
    var b = document.getElementById('post-body');
    if (b) {
      b.className = 'panel rv in';
      b.innerHTML = '<p class="lead">' + esc(msg) + '</p>';
    }
    var m = document.getElementById('post-meta');
    if (m) m.textContent = '';
    document.querySelectorAll('.post-hero .rv, .post-body-wrap .rv').forEach(function (el) { el.classList.add('in'); });
  }

  function render(post) {
    document.title = post.title + ' — Dyunetra Blog';
    var t = document.getElementById('post-title');
    if (t) t.textContent = post.title;
    var meta = document.getElementById('post-meta');
    if (meta) {
      var cat = CAT_NAMES[(post.category || '').toLowerCase()] || post.category || 'Note';
      var date = '';
      try { date = new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) {}
      meta.textContent = cat + ' · ' + date + ' · ' + (post.read_time || '');
    }
    var body = document.getElementById('post-body');
    if (body) {
      body.className = 'panel rv in';
      body.innerHTML = String(post.body).split(/\n{1,}/).map(function (p) {
        p = p.trim(); return p ? '<p>' + esc(p) + '</p>' : '';
      }).join('');
    }
    var d = document.querySelector('meta[name="description"]');
    if (d && post.excerpt) d.setAttribute('content', post.excerpt);
    document.querySelectorAll('.post-hero .rv, .post-body-wrap .rv').forEach(function (el) { el.classList.add('in'); });
  }

  var slug = slugFromUrl();
  if (!slug) { fail('No article specified. Pick one from the blog index.'); return; }

  fetch(SB_URL + '/rest/v1/posts?select=title,category,excerpt,body,read_time,published,published_at&slug=eq.' + encodeURIComponent(slug) + '&published=eq.true&limit=1', {
    headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY }
  })
    .then(function (r) { if (!r.ok) throw new Error('status ' + r.status); return r.json(); })
    .then(function (rows) {
      if (Array.isArray(rows) && rows.length) render(rows[0]);
      else fail('This article does not exist or is not published.');
    })
    .catch(function () { fail('Could not load the article. Please try again.'); });
})();
