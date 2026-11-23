(() => {
  'use strict';
  const byId = (id) => document.getElementById(id);
  const els = {
    title: byId('pageTitle'), description: byId('metaDescription'), url: byId('pageUrl'), site: byId('siteName'),
    titleCount: byId('titleCount'), descriptionCount: byId('descriptionCount'), titleWidth: byId('titleWidth'),
    titleMeter: byId('titleMeter'), descriptionMeter: byId('descriptionMeter'), descriptionStatus: byId('descriptionStatus'),
    previewSite: byId('previewSite'), previewUrl: byId('previewUrl'), previewTitle: byId('previewTitle'),
    previewDescription: byId('previewDescription'), canvas: byId('previewCanvas'), metaCode: byId('metaCode'),
    desktop: byId('desktopBtn'), mobile: byId('mobileBtn'), sample: byId('sampleBtn'),
    copyTags: byId('copyTagsBtn'), copyTitle: byId('copyTitleBtn'), copyDesc: byId('copyDescBtn'),
    feedbackText: byId('feedbackText'), feedbackDot: byId('feedbackDot'), toast: byId('toast')
  };
  const example = {
    title: 'Technical SEO & Web Development Services | Mehedi Hasan',
    description: 'Improve your website with full-stack development, technical SEO, and AI automation solutions by Mehedi Hasan. Explore services and real project work.',
    url: 'https://mehedihasan.work/', site: 'Mehedi Hasan'
  };
  let view = 'desktop';
  let toastTimer = null;
  const measure = document.createElement('canvas').getContext('2d');
  const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, {granularity: 'grapheme'}) : null;
  function charCount(text) { return segmenter ? Array.from(segmenter.segment(text)).length : Array.from(text).length; }
  function estimatePx(text) {
    if (!measure) return Math.round(charCount(text) * 10);
    measure.font = view === 'desktop' ? '20px Arial' : '19px Arial';
    return Math.round(measure.measureText(text).width);
  }
  function sanitizeUrl(value) {
    const raw = value.trim();
    if (!raw) return {display:'example.com/page', valid:true, empty:true};
    try {
      const parsed = new URL(raw);
      if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname.includes('.')) throw new Error('invalid');
      return {display:parsed.hostname + (parsed.pathname === '/' ? '' : parsed.pathname) + parsed.search, valid:true, host:parsed.hostname};
    } catch { return {display:'Enter a valid https:// URL', valid:false}; }
  }
  const xmlEscape = (text) => String(text).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  function setMeter(el, ratio, kind) {
    el.style.width = Math.min(100, Math.max(0, ratio * 100)) + '%';
    el.classList.toggle('warn', kind === 'warn');
    el.classList.toggle('over', kind === 'over');
  }
  function setView(next) {
    view = next;
    els.canvas.classList.toggle('mobile', view === 'mobile');
    els.desktop.classList.toggle('selected', view === 'desktop');
    els.mobile.classList.toggle('selected', view === 'mobile');
    els.desktop.setAttribute('aria-pressed', String(view === 'desktop'));
    els.mobile.setAttribute('aria-pressed', String(view === 'mobile'));
    render();
  }
  function render() {
    const title = els.title.value.trim();
    const desc = els.description.value.trim();
    const site = els.site.value.trim();
    const inputUrl = sanitizeUrl(els.url.value);
    const titleChars = charCount(els.title.value);
    const descChars = charCount(els.description.value);
    const titlePx = estimatePx(title);
    const titleGuidePx = view === 'desktop' ? 580 : 640; // Rough one-line desktop vs. two-line mobile guide
    const descGuideChars = 160;
    els.titleCount.textContent = `${titleChars} character${titleChars === 1 ? '' : 's'}`;
    els.descriptionCount.textContent = `${descChars} character${descChars === 1 ? '' : 's'}`;
    els.previewSite.textContent = site || inputUrl.host || 'Your site';
    els.previewUrl.textContent = inputUrl.display;
    els.previewTitle.textContent = title || 'Your page title will appear here';
    els.previewDescription.textContent = desc || 'Your meta description preview will appear here. Add a useful summary of this page.';
    els.titleWidth.textContent = `${titlePx}px / ~${titleGuidePx}px`;
    const ratioTitle = titlePx / titleGuidePx;
    setMeter(els.titleMeter, ratioTitle, ratioTitle > 1 ? 'over' : ratioTitle > .9 ? 'warn' : 'good');
    const ratioDesc = descChars / descGuideChars;
    setMeter(els.descriptionMeter, ratioDesc, ratioDesc > 1 ? 'over' : ratioDesc > .9 ? 'warn' : 'good');
    els.descriptionStatus.textContent = descChars > descGuideChars ? 'Longer than guide' : descChars < 70 ? 'Try more detail' : 'Within rough guide';
    els.url.setAttribute('aria-invalid', String(!inputUrl.valid));
    const validTitle = title.length > 0;
    const validDesc = desc.length > 0;
    const code = [
      `<title>${xmlEscape(title)}</title>`,
      `<meta name="description" content="${xmlEscape(desc)}">`
    ].join('\n');
    els.metaCode.textContent = code;
    els.feedbackDot.classList.remove('good', 'warn');
    if (!validTitle || !validDesc) {
      els.feedbackText.textContent = 'Add both a descriptive page title and a helpful meta description.';
      els.feedbackDot.classList.add('warn');
    } else if (!inputUrl.valid) {
      els.feedbackText.textContent = 'Use a valid http:// or https:// URL for a realistic preview.';
      els.feedbackDot.classList.add('warn');
    } else if (ratioTitle > 1 || ratioDesc > 1) {
      els.feedbackText.textContent = 'Some text exceeds our rough editing guides. Google may display it differently.';
      els.feedbackDot.classList.add('warn');
    } else {
      els.feedbackText.textContent = 'Looks good for a first draft. Compare the text with your page content and search intent.';
      els.feedbackDot.classList.add('good');
    }
  }
  async function copy(text, successMessage) {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      notify(successMessage);
    } catch {
      // Clipboard permission is not always available, such as when previewing with file://.
      notify('Copy unavailable here. Open the page over HTTPS and try again.');
    }
  }
  function notify(message) {
    els.toast.textContent = message;
    els.toast.classList.add('visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('visible'), 3200);
  }
  for (const node of [els.title, els.description, els.url, els.site]) node.addEventListener('input', render);
  els.desktop.addEventListener('click', () => setView('desktop'));
  els.mobile.addEventListener('click', () => setView('mobile'));
  els.sample.addEventListener('click', () => {
    els.title.value = example.title;
    els.description.value = example.description;
    els.url.value = example.url;
    els.site.value = example.site;
    setView('desktop');
    notify('Example loaded');
  });
  els.copyTags.addEventListener('click', () => copy(els.metaCode.textContent, 'HTML meta tags copied'));
  els.copyTitle.addEventListener('click', () => copy(els.title.value.trim(), 'SEO title copied'));
  els.copyDesc.addEventListener('click', () => copy(els.description.value.trim(), 'Meta description copied'));
  render();
})();