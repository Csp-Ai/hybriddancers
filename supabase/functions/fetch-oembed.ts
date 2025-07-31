import { serve } from "https://deno.land/std/http/server.ts";

const cache = new Map<string, { time: number; data: string }>();
const TTL = 60 * 60 * 1000; // 1 hour

serve(async (req) => {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) {
    return new Response('url required', { status: 400 });
  }

  const cached = cache.get(url);
  if (cached && Date.now() - cached.time < TTL) {
    return new Response(cached.data, { headers: { "Content-Type": "application/json" } });
  }

  const token = Deno.env.get('IG_OEMBED_TOKEN') ?? '';
  const endpoint = `https://graph.facebook.com/v18.0/instagram_oembed?omitscript=true&url=${encodeURIComponent(url)}${token ? `&access_token=${token}` : ''}`;
  try {
    const res = await fetch(endpoint);
    const text = await res.text();
    cache.set(url, { time: Date.now(), data: text });
    return new Response(text, { headers: { 'Content-Type': 'application/json' } });
  } catch (_) {
    const fallback = JSON.stringify({ html: `<iframe src="${url}/embed" allowfullscreen loading="lazy"></iframe>` });
    return new Response(fallback, { headers: { 'Content-Type': 'application/json' } });
  }
});
