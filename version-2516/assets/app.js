(function() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function() {
      const open = mobileNav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  const carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 4500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", play);
    showSlide(0);
    play();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  document.querySelectorAll("[data-filter-scope]").forEach(function(scope) {
    const panel = scope.previousElementSibling && scope.previousElementSibling.classList.contains("filter-panel")
      ? scope.previousElementSibling
      : document.querySelector(".filter-panel");

    if (!panel) {
      return;
    }

    const input = panel.querySelector("[data-filter-input]");
    const region = panel.querySelector("[data-filter-region]");
    const type = panel.querySelector("[data-filter-type]");
    const cards = Array.from(scope.querySelectorAll(".movie-card"));

    function applyFilter() {
      const keyword = normalize(input ? input.value : "");
      const selectedRegion = normalize(region ? region.value : "");
      const selectedType = normalize(type ? type.value : "");

      cards.forEach(function(card) {
        const haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        const okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const okRegion = !selectedRegion || normalize(card.getAttribute("data-region")) === selectedRegion;
        const okType = !selectedType || normalize(card.getAttribute("data-type")) === selectedType;
        card.classList.toggle("is-hidden", !(okKeyword && okRegion && okType));
      });
    }

    [input, region, type].forEach(function(control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });

  const heroSearch = document.querySelector(".hero-search");
  const firstFilterInput = document.querySelector("[data-filter-input]");

  if (heroSearch && firstFilterInput) {
    heroSearch.addEventListener("submit", function(event) {
      event.preventDefault();
      const query = heroSearch.querySelector("input");
      firstFilterInput.value = query ? query.value : "";
      firstFilterInput.dispatchEvent(new Event("input", { bubbles: true }));
      document.getElementById("site-search")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
})();
