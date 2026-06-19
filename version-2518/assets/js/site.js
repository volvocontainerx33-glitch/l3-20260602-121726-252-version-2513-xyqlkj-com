(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            const isOpen = mobileMenu.classList.toggle("is-open");
            document.body.classList.toggle("is-menu-open", isOpen);
            menuButton.textContent = isOpen ? "×" : "☰";
        });
    }

    const filterInput = document.querySelector("[data-filter-input]");
    const categoryButtons = Array.from(document.querySelectorAll("[data-category-filter]"));
    const sortSelect = document.querySelector("[data-sort-select]");
    const grids = Array.from(document.querySelectorAll("[data-card-grid]"));
    const cards = Array.from(document.querySelectorAll(".movie-card"));
    let activeCategory = "";

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function readQueryValue() {
        const input = document.querySelector("[data-read-query]");
        if (!input) {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const value = params.get("q") || "";
        input.value = value;
    }

    function cardMatches(card, query) {
        const haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.category,
            card.dataset.keywords
        ].join(" "));
        const category = normalize(card.dataset.category);
        const categoryMatched = !activeCategory || category === normalize(activeCategory);
        return categoryMatched && (!query || haystack.includes(query));
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        const query = normalize(filterInput ? filterInput.value : "");
        cards.forEach(function (card) {
            card.classList.toggle("is-hidden-card", !cardMatches(card, query));
        });
    }

    function sortCards(value) {
        if (!grids.length || !cards.length) {
            return;
        }
        grids.forEach(function (grid) {
            const gridCards = Array.from(grid.querySelectorAll(".movie-card"));
            const sorted = gridCards.slice().sort(function (a, b) {
                if (value === "rating") {
                    return parseFloat(b.dataset.rating || "0") - parseFloat(a.dataset.rating || "0");
                }
                if (value === "year") {
                    return parseInt(b.dataset.year || "0", 10) - parseInt(a.dataset.year || "0", 10);
                }
                if (value === "title") {
                    return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
                }
                return 0;
            });
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        });
    }

    readQueryValue();

    if (filterInput) {
        filterInput.addEventListener("input", applyFilters);
    }

    categoryButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            activeCategory = button.dataset.categoryFilter || "";
            categoryButtons.forEach(function (item) {
                item.classList.toggle("is-active", item === button);
            });
            applyFilters();
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener("change", function () {
            sortCards(sortSelect.value);
            applyFilters();
        });
    }

    applyFilters();
})();
