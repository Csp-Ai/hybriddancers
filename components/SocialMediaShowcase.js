export function SocialMediaShowcase(section) {
  if (!section) return;

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

    const tiktok = section.querySelector('.tiktok-embed');
    if (tiktok) {
      const ttUrl = tiktok.dataset.url;
      if (ttUrl) {
        fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(ttUrl)}`)
          .then(r => r.json())
          .then(d => {
            tiktok.innerHTML = d.html || '';
            const s = document.createElement('script');
            s.src = 'https://www.tiktok.com/embed.js';
            document.body.appendChild(s);
          })
          .catch(() => {});
      }
    }

    const fb = section.querySelector('.fb-post');
    if (fb) {
      const fbUrl = fb.dataset.url;
      if (fbUrl) {
        const endpoint = `https://graph.facebook.com/v10.0/oembed_page?url=${encodeURIComponent(fbUrl)}`;
        fetch(endpoint)
          .then(r => r.json())
          .then(d => {
            fb.innerHTML = d.html || '';
            if (!document.querySelector('script[src^="https://connect.facebook.net"]')) {
              const script = document.createElement('script');
              script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v17.0';
              document.body.appendChild(script);
            } else if (window.FB && window.FB.XFBML) {
              window.FB.XFBML.parse(fb);
            }
          })
          .catch(() => {});
      }
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
