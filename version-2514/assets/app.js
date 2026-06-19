(function () {
    var body = document.body;
    var navToggle = document.querySelector(".nav-toggle");

    if (navToggle) {
        navToggle.addEventListener("click", function () {
            body.classList.toggle("nav-open");
        });
    }

    var heroSlides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var heroDots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var heroIndex = 0;

    function setHeroSlide(index) {
        if (!heroSlides.length) {
            return;
        }

        heroIndex = (index + heroSlides.length) % heroSlides.length;

        heroSlides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === heroIndex);
        });

        heroDots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === heroIndex);
        });
    }

    if (heroSlides.length) {
        heroDots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                setHeroSlide(dotIndex);
            });
        });

        setInterval(function () {
            setHeroSlide(heroIndex + 1);
        }, 5200);
    }

    var heroSearch = document.querySelector(".hero-search");

    if (heroSearch) {
        heroSearch.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = heroSearch.querySelector("input");
            var keyword = input ? input.value.trim() : "";
            var target = "./search.html";

            if (keyword) {
                target += "?q=" + encodeURIComponent(keyword);
            }

            window.location.href = target;
        });
    }

    var searchInput = document.querySelector(".search-box");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var emptyResult = document.querySelector(".empty-result");
    var filterChips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var activeFilter = "all";

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var keyword = normalize(searchInput ? searchInput.value : "");
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags")
            ].join(" "));
            var cardFilter = card.getAttribute("data-category") || "all";
            var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchedFilter = activeFilter === "all" || cardFilter === activeFilter;
            var shouldShow = matchedKeyword && matchedFilter;

            card.style.display = shouldShow ? "" : "none";

            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyResult) {
            emptyResult.classList.toggle("is-visible", visible === 0);
        }
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");

        if (query) {
            searchInput.value = query;
        }

        searchInput.addEventListener("input", filterCards);
    }

    if (filterChips.length) {
        filterChips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                filterChips.forEach(function (item) {
                    item.classList.remove("is-active");
                });

                chip.classList.add("is-active");
                activeFilter = chip.getAttribute("data-filter") || "all";
                filterCards();
            });
        });
    }

    filterCards();

    var playerShell = document.querySelector(".player-shell");

    if (playerShell) {
        var playerVideo = playerShell.querySelector("video");
        var playerOverlay = playerShell.querySelector(".player-overlay");
        var playerUrl = playerShell.getAttribute("data-video");
        var playerReady = false;
        var hlsInstance = null;

        function preparePlayer() {
            if (!playerVideo || !playerUrl || playerReady) {
                return;
            }

            playerReady = true;

            if (playerVideo.canPlayType("application/vnd.apple.mpegurl")) {
                playerVideo.src = playerUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(playerUrl);
                hlsInstance.attachMedia(playerVideo);
            } else {
                playerVideo.src = playerUrl;
            }
        }

        function startPlayer() {
            preparePlayer();
            playerShell.classList.add("is-playing");

            if (playerVideo) {
                var playTask = playerVideo.play();

                if (playTask && typeof playTask.catch === "function") {
                    playTask.catch(function () {});
                }
            }
        }

        if (playerOverlay) {
            playerOverlay.addEventListener("click", function (event) {
                event.preventDefault();
                startPlayer();
            });
        }

        playerShell.addEventListener("click", function (event) {
            if (event.target === playerShell || event.target === playerVideo) {
                startPlayer();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
