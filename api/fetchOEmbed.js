const fs = require('fs').promises;
const path = require('path');

const cache = new Map();
const TTL = 60 * 60 * 1000; // one hour

async function logError(msg) {
  console.error(msg);
  try {
    const file = path.join(__dirname, '..', 'data', 'logs.json');
    const logs = JSON.parse(await fs.readFile(file, 'utf8'));
    logs.push({ time: new Date().toISOString(), action: 'oembed_error', details: msg });
    await fs.writeFile(file, JSON.stringify(logs, null, 2));
  } catch (e) {
    console.error('Failed to write log', e);
  }
}

function normalizeUrl(raw) {
  try {
    const u = new URL(raw);
    u.hash = '';
    if (u.hostname.includes('tiktok.com')) u.search = '';
    return u.toString();
  } catch {
    return raw;
  }
}

module.exports = async function fetchOEmbed(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'url required' });
  }

  const normalized = normalizeUrl(url);

  const cached = cache.get(normalized);
  if (cached && Date.now() - cached.time < TTL) {
    return res.json(cached.data);
  }

  try {
    const host = new URL(normalized).hostname;
    let endpoint;
    if (host.includes('instagram.com')) {
      const token = process.env.IG_OEMBED_TOKEN || '';
      endpoint = `https://graph.facebook.com/v18.0/instagram_oembed?omitscript=true&url=${encodeURIComponent(normalized)}${token ? `&access_token=${token}` : ''}`;
    } else if (host.includes('tiktok.com')) {
      endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(normalized)}`;
    } else {
      return res.status(400).json({ error: 'unsupported host' });
    }

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`oEmbed responded ${response.status}`);
    }
    const data = await response.json();
    cache.set(normalized, { time: Date.now(), data });
    res.json(data);
  } catch (err) {
    await logError(err.message);
    res.json({ html: `<iframe src="${normalized}/embed" allowfullscreen loading="lazy"></iframe>` });
  }
};
