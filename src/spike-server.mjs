import { defuddleExtract } from './extractor-defuddle.mjs';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('fetch');

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: "missing 'fetch' query param" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    let upstream;
    try {
      upstream = await fetch(targetUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': USER_AGENT },
      });
    } catch (err) {
      clearTimeout(timer);
      return new Response(
        JSON.stringify({ error: `upstream fetch failed: ${err.message}` }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }
    clearTimeout(timer);

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: `upstream returned ${upstream.status}` }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }

    const html = await upstream.text();
    let content;
    try {
      content = await defuddleExtract(html, targetUrl);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `defuddle failed: ${err.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ content }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  },
};
