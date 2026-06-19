var MoviePlayer = (function () {
  function init(url) {
    var video = document.querySelector(".movie-video");
    var button = document.querySelector(".play-cover");
    var box = document.querySelector("[data-player-box]");
    var hlsInstance = null;
    var loaded = false;

    function load() {
      if (!video || !url) {
        return Promise.resolve();
      }
      if (loaded) {
        return Promise.resolve();
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        return Promise.resolve();
      }
      video.src = url;
      return Promise.resolve();
    }

    function start() {
      load().then(function () {
        if (box) {
          box.classList.add("is-playing");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          start();
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  return {
    init: init
  };
})();
