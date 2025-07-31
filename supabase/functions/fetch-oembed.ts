import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) {
    return new Response('url required', { status: 400 });
  }
  const token = Deno.env.get('IG_OEMBED_TOKEN') ?? '';
  const endpoint = `https://graph.facebook.com/v18.0/instagram_oembed?omitscript=true&url=${encodeURIComponent(url)}${token ? `&access_token=${token}` : ''}`;
  try {
    const res = await fetch(endpoint);
    const text = await res.text();
    return new Response(text, { headers: { 'Content-Type': 'application/json' } });
  } catch (_) {
    return new Response('error', { status: 500 });
  }
});
