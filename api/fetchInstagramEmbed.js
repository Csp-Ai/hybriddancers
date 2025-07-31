module.exports = async function fetchInstagramEmbed(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'url required' });
  }
  try {
    const token = process.env.IG_OEMBED_TOKEN || '';
    const endpoint = `https://graph.facebook.com/v18.0/instagram_oembed?omitscript=true&url=${encodeURIComponent(url)}${token ? `&access_token=${token}` : ''}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Instagram responded ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch' });
  }
};
