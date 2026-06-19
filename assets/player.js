
(function(){
  function initPlayer(box){
    const video = box.querySelector('video');
    const overlay = box.querySelector('.video-poster-overlay');
    if(!video) return;
    const src = video.dataset.src || video.getAttribute('src');
    if(!src) return;
    if(window.Hls && Hls.isSupported()){
      const hls = new Hls({enableWorker:true, lowLatencyMode:false});
      hls.loadSource(src);
      hls.attachMedia(video);
    }else if(video.canPlayType('application/vnd.apple.mpegurl')){
      video.src = src;
    }else{
      video.src = src;
    }
    if(overlay) overlay.style.display = 'none';
    const p = video.play();
    if(p && p.catch) p.catch(function(){});
  }
  document.querySelectorAll('[data-player]').forEach(function(box){
    const btn = box.querySelector('[data-play]');
    if(btn) btn.addEventListener('click', function(){ initPlayer(box); });
  });
})();
