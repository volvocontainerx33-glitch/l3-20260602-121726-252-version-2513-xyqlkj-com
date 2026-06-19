(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    var header = document.querySelector(".site-header");
    var button = document.querySelector(".menu-toggle");
    if (!header || !button) {
      return;
    }

    button.addEventListener("click", function () {
      var isOpen = header.classList.toggle("is-open");
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      var panel = header.querySelector(".mobile-panel");
      if (panel) {
        panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
      }
    });
  }

  function initCategoryFilter() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-filter-grid]");
    if (!panel || !grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var count = document.querySelector("[data-filter-count]");
    var empty = document.querySelector("[data-empty-state]");
    var inputs = Array.prototype.slice.call(panel.querySelectorAll("input, select"));

    function matches(card, query, region, type, year) {
      var title = normalize(card.getAttribute("data-title"));
      var genre = normalize(card.getAttribute("data-genre"));
      var cardRegion = card.getAttribute("data-region") || "";
      var cardType = card.getAttribute("data-type") || "";
      var cardYear = card.getAttribute("data-year") || "";
      var textOk = !query || title.indexOf(query) > -1 || genre.indexOf(query) > -1;
      var regionOk = !region || cardRegion === region;
      var typeOk = !type || cardType === type;
      var yearOk = !year || cardYear === year;
      return textOk && regionOk && typeOk && yearOk;
    }

    function applyFilter() {
      var query = normalize(panel.querySelector("[data-filter-keyword]").value);
      var region = panel.querySelector("[data-filter-region]").value;
      var type = panel.querySelector("[data-filter-type]").value;
      var year = panel.querySelector("[data-filter-year]").value;
      var visible = 0;

      cards.forEach(function (card) {
        var ok = matches(card, query, region, type, year);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visible + " 部影片";
      }
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", applyFilter);
      input.addEventListener("change", applyFilter);
    });

    applyFilter();
  }

  function renderSearchResults(container, movies) {
    container.innerHTML = movies.map(function (movie) {
      var genres = movie.genre.slice(0, 2).map(function (item) {
        return "<span>" + item + "</span>";
      }).join("");
      var tags = movie.tags.slice(0, 3).map(function (item) {
        return "<span>" + item + "</span>";
      }).join("");
      return "<article class=\"movie-card\">" +
        "<a class=\"movie-cover\" href=\"" + movie.url + "\" aria-label=\"" + movie.title + "\">" +
        "<img src=\"" + movie.cover + "\" alt=\"" + movie.title + "\" loading=\"lazy\">" +
        "<span class=\"score\">★ " + movie.rating.toFixed(1) + "</span>" +
        "<span class=\"cover-gradient\"></span>" +
        "</a>" +
        "<div class=\"movie-info\">" +
        "<h3><a href=\"" + movie.url + "\">" + movie.title + "</a></h3>" +
        "<div class=\"movie-meta\"><span>" + movie.year + "</span><span>" + movie.region + "</span><span>" + movie.duration + "</span></div>" +
        "<div class=\"genre-pills\">" + genres + "</div>" +
        "<p>" + movie.oneLine + "</p>" +
        "<div class=\"card-tags\">" + tags + "</div>" +
        "</div>" +
        "</article>";
    }).join("");
  }

  function initSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var result = document.querySelector("[data-search-results]");
    var count = document.querySelector("[data-search-count]");
    if (!form || !input || !result || typeof MOVIES === "undefined") {
      return;
    }

    function runSearch() {
      var query = normalize(input.value);
      var matches = MOVIES.filter(function (movie) {
        var text = normalize(movie.title + " " + movie.region + " " + movie.type + " " + movie.genre.join(" ") + " " + movie.tags.join(" ") + " " + movie.oneLine);
        return !query || text.indexOf(query) > -1;
      }).slice(0, 160);

      renderSearchResults(result, matches);
      if (count) {
        count.textContent = query ? "找到 " + matches.length + " 条相关结果" : "推荐展示 " + matches.length + " 部影片";
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      runSearch();
    });
    input.addEventListener("input", runSearch);
    runSearch();
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-video");
    var overlay = document.querySelector(".player-overlay");
    var state = document.querySelector(".player-state");
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function setState(text) {
      if (state) {
        state.textContent = text || "";
      }
    }

    function startPlayback() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setState("点击播放器继续观看");
        });
      }
    }

    function loadSource() {
      if (video.getAttribute("data-ready") === "1") {
        startPlayback();
        return;
      }

      setState("正在加载");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.setAttribute("data-ready", "1");
        video.addEventListener("loadedmetadata", startPlayback, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.setAttribute("data-ready", "1");
          setState("");
          startPlayback();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setState("播放暂时不可用，请稍后重试");
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setState("正在恢复播放");
            hlsInstance.recoverMediaError();
          } else {
            setState("播放暂时不可用，请稍后重试");
            hlsInstance.destroy();
          }
        });
        return;
      }

      setState("当前浏览器暂时无法播放");
    }

    function begin() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      loadSource();
    }

    if (overlay) {
      overlay.addEventListener("click", begin);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      setState("");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initCategoryFilter();
    initSearchPage();
  });
})();
