export function SocialMediaShowcase(section) {
  if (!section) return;

  const preview = new URLSearchParams(window.location.search).get('previewSocial');
  if (preview !== 'true') {
    section.style.display = 'none';
    return;
  }

  const start = () => {
    const { SOCIAL_LINKS } = window;
    if (!SOCIAL_LINKS) return;

    const carouselEl = section.querySelector('.instagram-carousel');
    if (carouselEl) {
      const reels = [
        `${SOCIAL_LINKS.instagram}p/CyGZc8UPL2g`,
        `${SOCIAL_LINKS.instagram}p/CyDyapCrkYZ`,
        `${SOCIAL_LINKS.instagram}p/Cx7OPawrQxt`
      ];
      if (window.SocialReelCarousel) {
        window.SocialReelCarousel(carouselEl, reels);
      }
    }

    const loadTikTok = () => {
      if (!section.querySelector('.tiktok-embed')) {
        return;
      }
      if (!document.querySelector('script[src="https://www.tiktok.com/embed.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.tiktok.com/embed.js';
        document.body.appendChild(script);
      }
    };

    const tiktok = section.querySelector('.tiktok-embed');
    if (tiktok) loadTikTok();

    const fb = section.querySelector('.fb-post');
    if (fb && !fb.src) {
      fb.src = `${SOCIAL_LINKS.facebook}embed`;
    }
  };

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, o) => {
      if (entries[0].isIntersecting) {
        start();
        o.disconnect();
      }
    }, { rootMargin: '0px 0px 200px 0px' });
    obs.observe(section);
  } else {
    start();
  }
}
