import { injectEmbed } from '../socialEmbed.utils.js';

export function SocialMediaShowcase(section) {
  if (!section) return;

  const allowed = /(?:^|\.)hybriddancers\.com$/i.test(window.location.hostname);
  if (!allowed) return;

  const addSkeleton = (el) => {
    const sk = document.createElement('div');
    sk.className = 'embed-skeleton';
    el.appendChild(sk);
    return sk;
  };

  const loadEmbed = (el, url) => {
    if (!url) return;
    const sk = addSkeleton(el);
    injectEmbed(el, url).finally(() => {
      const obs = new MutationObserver((m, o) => {
        if (el.querySelector('iframe') || el.querySelector('blockquote')) {
          sk.remove();
          el.classList.add('loaded');
          o.disconnect();
        }
      });
      obs.observe(el, { childList: true, subtree: true });
    });
  };

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
      loadEmbed(tiktok, ttUrl);
    }

    const fb = section.querySelector('.fb-post');
    if (fb) {
      const fbUrl = fb.dataset.url;
      if (fbUrl) {
        const endpoint = `https://graph.facebook.com/v10.0/oembed_page?url=${encodeURIComponent(fbUrl)}`;
        const sk = addSkeleton(fb);
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
          .catch(() => {
            fb.innerHTML = '<p class="embed-error">Unable to load content.</p>';
          })
          .finally(() => {
            const check = () => {
              if (fb.querySelector('iframe') || fb.querySelector('blockquote')) {
                sk.remove();
              } else {
                requestAnimationFrame(check);
              }
            };
            requestAnimationFrame(check);
          });
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
