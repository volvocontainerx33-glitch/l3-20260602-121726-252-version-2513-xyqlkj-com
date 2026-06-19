import { H as Hls } from './video-vendor-dru42stk.js';

function initPlayer(shell) {
  var video = shell.querySelector('video[data-src]');
  var button = shell.querySelector('.player-overlay');

  if (!video || !button) {
    return;
  }

  var loaded = false;

  function loadAndPlay() {
    var src = video.getAttribute('data-src');

    if (!src) {
      return;
    }

    if (!loaded) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (Hls && Hls.isSupported && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }

      loaded = true;
    }

    shell.classList.add('is-playing');
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        shell.classList.remove('is-playing');
      });
    }
  }

  button.addEventListener('click', loadAndPlay);
  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0) {
      shell.classList.remove('is-playing');
    }
  });
}

Array.prototype.forEach.call(document.querySelectorAll('.player-shell'), initPlayer);
