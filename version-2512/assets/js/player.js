document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".movie-player").forEach(function (player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var streamUrl = player.getAttribute("data-stream");
    var hlsInstance = null;
    var ready = false;

    function attachStream() {
      if (!video || !streamUrl || ready) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        ready = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        ready = true;
        return;
      }

      video.src = streamUrl;
      ready = true;
    }

    function playVideo() {
      attachStream();
      player.classList.add("is-playing");
      video.setAttribute("controls", "controls");
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
});
