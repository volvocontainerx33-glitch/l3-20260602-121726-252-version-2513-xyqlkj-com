(function () {
  var navButton = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHeroTimer() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = Number(dot.getAttribute('data-hero-dot') || 0);
      showSlide(index);
      if (timer) {
        window.clearInterval(timer);
        startHeroTimer();
      }
    });
  });

  showSlide(0);
  startHeroTimer();

  var filterInput = document.querySelector('.local-filter');
  var sortSelect = document.querySelector('.year-sort');
  var filterTarget = document.querySelector('.filter-target');

  function applyFilter() {
    if (!filterTarget) {
      return;
    }

    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var cards = Array.prototype.slice.call(filterTarget.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre')
      ].join(' ').toLowerCase();
      card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
    });
  }

  function applySort() {
    if (!filterTarget || !sortSelect) {
      return;
    }

    var direction = sortSelect.value;
    var cards = Array.prototype.slice.call(filterTarget.querySelectorAll('.movie-card'));

    cards.sort(function (a, b) {
      var ay = Number(a.getAttribute('data-year')) || 0;
      var by = Number(b.getAttribute('data-year')) || 0;
      return direction === 'asc' ? ay - by : by - ay;
    });

    cards.forEach(function (card) {
      filterTarget.appendChild(card);
    });

    applyFilter();
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applySort);
  }
})();
