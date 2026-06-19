(function () {
  var input = document.getElementById('searchInput');
  var title = document.getElementById('searchTitle');
  var results = document.getElementById('searchResults');

  if (!input || !results) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  input.value = query;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function card(movie) {
    return [
      '<article class="movie-card card-hover" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '">',
      '  <a class="poster-link" href="' + escapeHtml(movie.detail_path) + '" aria-label="' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.image_no) + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="play-dot">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <h3><a href="' + escapeHtml(movie.detail_path) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.one_line) + '</p>',
      '    <div class="card-tags">',
      '      <span>' + escapeHtml(movie.category_name) + '</span>',
      '      <span>' + escapeHtml(movie.genre) + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function render(movies) {
    results.innerHTML = movies.map(card).join('');
  }

  if (!query.trim()) {
    return;
  }

  fetch('assets/js/movies.json')
    .then(function (response) {
      return response.json();
    })
    .then(function (movies) {
      var q = query.trim().toLowerCase();
      var filtered = movies.filter(function (movie) {
        return [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.one_line,
          movie.category_name
        ].join(' ').toLowerCase().indexOf(q) !== -1;
      }).slice(0, 120);

      if (title) {
        title.textContent = filtered.length ? '搜索：' + query : '未找到匹配结果';
      }

      render(filtered);
    });
})();
