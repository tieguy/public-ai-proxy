import { parseHTML } from 'linkedom/worker';
import { Defuddle } from 'defuddle/node';

const MAX_CHARS = 12000;

export async function defuddleExtract(html, sourceUrl) {
  const { document } = parseHTML(html);
  const result = await Defuddle(document, sourceUrl);
  const innerHtml = result?.content ?? '';
  if (!innerHtml) return '';

  const { document: textDoc } = parseHTML(`<!doctype html><body>${innerHtml}</body>`);
  const raw = textDoc.body?.textContent ?? '';

  return raw.replace(/\s+/g, ' ').trim().substring(0, MAX_CHARS);
}
