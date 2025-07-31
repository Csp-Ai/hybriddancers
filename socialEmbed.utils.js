export function normalizeUrl(url) {
  try {
    const u = new URL(url);
    u.hash = '';
    // strip tracking params from TikTok URLs
    if (u.hostname.includes('tiktok.com')) {
      u.search = '';
    }
    return u.toString().replace(/\/?$/, '');
  } catch {
    return url;
  }
}

export function debugEmbedsEnabled() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('debugEmbeds') === 'true';
}

export async function fetchEmbedData(url) {
  const endpoint = `/api/fetchOEmbed?url=${encodeURIComponent(normalizeUrl(url))}`;
  const res = await fetch(endpoint);
  return res.json();
}

export async function injectEmbed(el, url) {
  if (!el || !url) return;
  const debug = debugEmbedsEnabled();
  try {
    const data = await fetchEmbedData(url);
    if (data && data.html) {
      el.innerHTML = data.html;
    } else {
      throw new Error('Missing oEmbed html');
    }
    if (url.includes('tiktok.com')) {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      document.body.appendChild(script);
    }
    if (debug) {
      console.log('oEmbed result for', url, data);
    }
  } catch (err) {
    console.error('Embed failed', url, err);
    el.innerHTML = `<p class="embed-error">Preview unavailable. <a href="${url}" target="_blank" rel="noopener">Open post</a></p>`;
    if (debug) {
      const pre = document.createElement('pre');
      pre.className = 'embed-debug';
      pre.textContent = err.message;
      el.appendChild(pre);
    }
  }
}
