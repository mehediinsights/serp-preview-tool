import { charCount, sanitizeUrl, metaTags, DRAFT_KEY, parseDraft } from './core.js';
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
  function estimatePx(text) {
    if (!measure) return Math.round(charCount(text) * 10);
    measure.font = view === 'desktop' ? '20px Arial' : '19px Arial';
    return Math.round(measure.measureText(text).width);
  }
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
    // Use the actual preview width; mobile has an approximate two-line budget.
    const titleGuidePx = Math.round(els.previewTitle.clientWidth * (view === 'mobile' ? 2 : 1));
    const descGuideChars = 160;
    els.titleCount.textContent = `${titleChars} character${titleChars === 1 ? '' : 's'}`;
    els.descriptionCount.textContent = `${descChars} character${descChars === 1 ? '' : 's'}`;
    els.previewSite.textContent = site || inputUrl.host || 'Your site';
    els.previewUrl.textContent = inputUrl.display;
    els.previewTitle.textContent = title || 'Your page title will appear here';
    els.previewDescription.textContent = desc || 'Your meta description preview will appear here. Add a useful summary of this page.';
    els.titleWidth.textContent = `${titlePx}px / ~${titleGuidePx}px`;
    const ratioTitle = titleGuidePx > 0 ? titlePx / titleGuidePx : 0;
    setMeter(els.titleMeter, ratioTitle, ratioTitle > 1 ? 'over' : ratioTitle > .9 ? 'warn' : 'good');
    const ratioDesc = descChars / descGuideChars;
    setMeter(els.descriptionMeter, ratioDesc, ratioDesc > 1 ? 'over' : ratioDesc > .9 ? 'warn' : 'good');
    els.descriptionStatus.textContent = descChars > descGuideChars ? 'Longer than guide' : descChars < 70 ? 'Try more detail' : 'Within rough guide';
    const favicon = document.querySelector('.serp-favicon');
    favicon.textContent = (site || inputUrl.host || 'S').match(/^./u)?.[0]?.toUpperCase() || 'S';
    els.url.setAttribute('aria-invalid', String(!inputUrl.valid));
    const validTitle = title.length > 0;
    const validDesc = desc.length > 0;
    const code = metaTags(title, desc);
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
  const remember = byId('rememberDraft');
  const fields = { title: els.title, description: els.description, url: els.url, site: els.site };
  function persist() {
    if (!remember.checked) return;
    try {
      const data = Object.fromEntries(Object.entries(fields).map(([k, node]) => [k, node.value]));
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 2, ...data, view }));
    } catch { remember.checked = false; notify('Draft storage is unavailable on this browser.'); }
  }
  function removeDraft() {
    try { localStorage.removeItem(DRAFT_KEY); }
    catch { notify('Browser storage could not be cleared. Check your browser settings.'); }
  }
  try {
    const draft = parseDraft(localStorage.getItem(DRAFT_KEY));
    if (draft) {
      remember.checked = true;
      for (const [k,node] of Object.entries(fields)) node.value = draft[k];
      setView(draft.view);
    }
  } catch { /* The editor works without storage. */ }
  remember.addEventListener('change', () => remember.checked ? persist() : removeDraft());
  for (const node of Object.values(fields)) node.addEventListener('input', () => { render(); persist(); });
  byId('clearBtn').addEventListener('click', () => {
    for (const node of Object.values(fields)) node.value = '';
    remember.checked = false;
    removeDraft();
    setView('desktop');
    els.title.focus();
    notify('Fields cleared.');
  });
  byId('downloadBtn').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([els.metaCode.textContent + '\n'], {type: 'text/plain;charset=utf-8'}));
    const a = document.createElement('a');
    a.href = url; a.download = 'seo-meta-tags.html';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Meta tag file prepared.');
  });
  if (typeof ResizeObserver === 'function') new ResizeObserver(render).observe(els.previewTitle);

  els.desktop.addEventListener('click', () => { setView('desktop'); persist(); });
  els.mobile.addEventListener('click', () => { setView('mobile'); persist(); });
  els.sample.addEventListener('click', () => {
    els.title.value = example.title;
    els.description.value = example.description;
    els.url.value = example.url;
    els.site.value = example.site;
    setView('desktop');
    persist();
    notify('Example loaded');
  });
  els.copyTags.addEventListener('click', () => copy(els.metaCode.textContent, 'HTML meta tags copied'));
  els.copyTitle.addEventListener('click', () => copy(els.title.value.trim(), 'SEO title copied'));
  els.copyDesc.addEventListener('click', () => copy(els.description.value.trim(), 'Meta description copied'));
  render();
})();