// Pure helpers shared by the browser and unit tests.
export function charCount(text) {
  return typeof Intl.Segmenter === 'function'
    ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)).length
    : Array.from(text).length;
}
export function sanitizeUrl(value) {
  const raw = value.trim();
  if (!raw) return { display: 'example.com/page', valid: true, empty: true };
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error();
    return { display: url.host + (url.pathname === '/' ? '' : url.pathname) + url.search, valid: true, host: url.hostname };
  } catch {
    return { display: 'Enter a valid HTTP or HTTPS URL', valid: false };
  }
}
export const escapeHtml = text => String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function metaTags(title, description) {
  return '<title>' + escapeHtml(title.trim()) + '</title>\n<meta name="description" content="' + escapeHtml(description.trim()) + '">';
}
export const DRAFT_KEY = 'serp-preview.draft.v2';
export function parseDraft(raw) {
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 2) return null;
    const limits = {title:300,description:1000,url:2048,site:100};
    for (const [key,max] of Object.entries(limits)) {
      if (typeof value[key] !== 'string' || value[key].length > max) return null;
    }
    if (!['desktop','mobile'].includes(value.view)) return null;
    return value;
  } catch { return null; }
}

