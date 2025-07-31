const cache = new Map();
const TTL = 60 * 60 * 1000; // one hour

module.exports = async function fetchOEmbed(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'url required' });
  }

  const cached = cache.get(url);
  if (cached && Date.now() - cached.time < TTL) {
    return res.json(cached.data);
  }

  try {
    const host = new URL(url).hostname;
    let endpoint;
    if (host.includes('instagram.com')) {
      const token = process.env.IG_OEMBED_TOKEN || '';
      endpoint = `https://graph.facebook.com/v18.0/instagram_oembed?omitscript=true&url=${encodeURIComponent(url)}${token ? `&access_token=${token}` : ''}`;
    } else if (host.includes('tiktok.com')) {
      endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    } else {
      return res.status(400).json({ error: 'unsupported host' });
    }

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`oEmbed responded ${response.status}`);
    }
    const data = await response.json();
    cache.set(url, { time: Date.now(), data });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.json({ html: `<iframe src="${url}/embed" allowfullscreen loading="lazy"></iframe>` });
  }
};
