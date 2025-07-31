export async function SocialReelCarousel(container, reels = []) {
  if (!container) return;

  // Load Splide assets if not already present
  const loadSplide = () => {
    return new Promise((resolve) => {
      if (window.Splide) return resolve();
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://cdn.jsdelivr.net/npm/@splidejs/splide@4/dist/css/splide.min.css';
      document.head.appendChild(css);
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@splidejs/splide@4/dist/js/splide.min.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };

  await loadSplide();

  const wrapper = document.createElement('div');
  wrapper.className = 'splide';
  const track = document.createElement('div');
  track.className = 'splide__track';
  const list = document.createElement('ul');
  list.className = 'splide__list';
  track.appendChild(list);
  wrapper.appendChild(track);
  container.appendChild(wrapper);

  reels.forEach((url) => {
    const li = document.createElement('li');
    li.className = 'splide__slide';
    li.dataset.url = url;
    li.innerHTML = `<div class="reel-thumb" role="img" aria-label="Instagram reel placeholder"></div>`;
    list.appendChild(li);
  });

  const splide = new Splide(wrapper, {
    type: 'loop',
    perPage: 1,
    gap: '1rem',
    pagination: true,
    arrows: true,
  });
  splide.mount();

  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const slide = entry.target;
        if (!slide.dataset.loaded) {
          const api = `/api/fetchOEmbed?url=${encodeURIComponent(slide.dataset.url)}`;
          fetch(api)
            .then((r) => r.json())
            .then((d) => {
              if (d && d.html) {
                slide.innerHTML = d.html;
              } else {
                slide.innerHTML = `<iframe src="${slide.dataset.url}/embed" allowfullscreen loading="lazy"></iframe>`;
              }
            })
            .catch(() => {
              slide.innerHTML = '<p class="reels-error">Unable to load reel.</p>';
            });
          slide.dataset.loaded = '1';
        }
        o.unobserve(slide);
      }
    });
  }, { root: wrapper, rootMargin: '0px 0px 200px 0px' });

  list.querySelectorAll('.splide__slide').forEach((slide) => obs.observe(slide));
}
