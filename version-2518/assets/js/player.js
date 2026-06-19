(function () {
    function initPlayer(box) {
        const video = box.querySelector("video");
        const playButton = box.querySelector("[data-play-button]");
        const source = video ? video.dataset.src : "";
        let hls = null;
        let attached = false;

        function attachSource() {
            if (!video || !source || attached) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                attached = true;
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                attached = true;
            }
        }

        function hideOverlay() {
            if (playButton) {
                playButton.classList.add("is-hidden");
            }
        }

        function showOverlay() {
            if (playButton && !video.ended) {
                playButton.classList.remove("is-hidden");
            }
        }

        function playVideo() {
            if (!video) {
                return;
            }
            attachSource();
            const request = video.play();
            if (request && typeof request.then === "function") {
                request.then(hideOverlay).catch(function () {
                    showOverlay();
                });
            } else {
                hideOverlay();
            }
        }

        attachSource();

        if (playButton) {
            playButton.addEventListener("click", playVideo);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", hideOverlay);
            video.addEventListener("pause", showOverlay);
            video.addEventListener("ended", showOverlay);
        }

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    document.querySelectorAll("[data-player]").forEach(initPlayer);
})();
