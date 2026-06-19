
(function(){
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if(toggle && nav){ toggle.addEventListener('click',()=>nav.classList.toggle('open')); }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const thumbs = Array.from(document.querySelectorAll('.hero-thumb'));
  let idx = 0, timer = null;
  function showHero(i){
    if(!slides.length) return;
    idx = (i + slides.length) % slides.length;
    slides.forEach((s,n)=>s.classList.toggle('active', n===idx));
    thumbs.forEach((t,n)=>t.classList.toggle('active', n===idx));
  }
  thumbs.forEach((t,n)=>t.addEventListener('click',()=>{showHero(n); restartHero();}));
  function restartHero(){
    if(timer) clearInterval(timer);
    if(slides.length>1) timer = setInterval(()=>showHero(idx+1), 5200);
  }
  showHero(0); restartHero();

  const quick = document.querySelector('[data-quick-search]');
  if(quick){
    quick.addEventListener('submit', function(e){
      e.preventDefault();
      const q = this.querySelector('input')?.value || '';
      window.location.href = 'search.html?q=' + encodeURIComponent(q);
    });
  }

  function normalize(s){return (s||'').toString().toLowerCase().trim();}
  const filterForm = document.querySelector('[data-filter-form]');
  const cards = Array.from(document.querySelectorAll('[data-title]'));
  const empty = document.querySelector('.empty-state');
  const countEl = document.querySelector('[data-result-count]');
  if(filterForm && cards.length){
    const params = new URLSearchParams(location.search);
    const q0 = params.get('q');
    if(q0 && filterForm.querySelector('[name="q"]')) filterForm.querySelector('[name="q"]').value = q0;
    function apply(){
      const q = normalize(filterForm.querySelector('[name="q"]')?.value);
      const region = normalize(filterForm.querySelector('[name="region"]')?.value);
      const type = normalize(filterForm.querySelector('[name="type"]')?.value);
      const year = normalize(filterForm.querySelector('[name="year"]')?.value);
      let visible = 0;
      cards.forEach(card=>{
        const blob = normalize([card.dataset.title,card.dataset.region,card.dataset.type,card.dataset.year,card.dataset.genre].join(' '));
        const ok = (!q || blob.includes(q)) &&
          (!region || normalize(card.dataset.region).includes(region)) &&
          (!type || normalize(card.dataset.type).includes(type)) &&
          (!year || normalize(card.dataset.year) === year);
        card.style.display = ok ? '' : 'none';
        if(ok) visible++;
      });
      if(empty) empty.style.display = visible ? 'none' : 'block';
      if(countEl) countEl.textContent = visible;
    }
    filterForm.addEventListener('input', apply);
    filterForm.addEventListener('change', apply);
    apply();
  }
})();
