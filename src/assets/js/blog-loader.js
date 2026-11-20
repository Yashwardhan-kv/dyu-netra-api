/* Loads blog scripts only on pages that need them */
(function () {
  var script;
  if (document.querySelector('.posts')) {
    script = 'assets/js/blog-api.js';
  } else if (document.getElementById('post-body')) {
    script = 'assets/js/post-api.js';
  } else return;
  var s = document.createElement('script');
  s.src = script;
  s.defer = true;
  document.body.appendChild(s);
})();
