import { defuddleExtract } from './extractor-defuddle.mjs';

const USER_AGENT =
  'extraction-experiment-spike/1.0 (https://github.com/alex-o-748/public-ai-proxy)';

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

    let upstream;
    try {
      upstream = await fetch(targetUrl, { headers: { 'User-Agent': USER_AGENT } });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `upstream fetch failed: ${err.message}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: `upstream returned ${upstream.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
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
