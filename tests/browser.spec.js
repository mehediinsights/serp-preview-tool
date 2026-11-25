import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('live inputs, unsafe URL, HTML injection and device switch',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('/');
 await page.locator('#pageTitle').fill('<img src=x onerror=alert(1)>');
 await expect(page.locator('#previewTitle')).toHaveText('<img src=x onerror=alert(1)>');
 await expect(page.locator('#metaCode')).toContainText('&lt;img');
 await expect(page.locator('#previewTitle img')).toHaveCount(0);
 await page.locator('#pageUrl').fill('javascript:alert(1)');
 await expect(page.locator('#pageUrl')).toHaveAttribute('aria-invalid','true');
 await page.locator('#mobileBtn').click();
 await expect(page.locator('#mobileBtn')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#previewCanvas')).toHaveClass(/mobile/);
 await page.locator('#sampleBtn').click();
 await expect(page.locator('#desktopBtn')).toHaveAttribute('aria-pressed','true');
 expect(errors).toEqual([]);
});
test('opt-in draft survives reload and clears',async({page})=>{
 await page.goto('/');
 await page.locator('#pageTitle').fill('Private draft');
 expect(await page.evaluate(()=>localStorage.getItem('serp-preview.draft.v2'))).toBeNull();
 await page.locator('#rememberDraft').check();
 await page.locator('#mobileBtn').click();
 await page.reload();
 await expect(page.locator('#pageTitle')).toHaveValue('Private draft');
 await expect(page.locator('#mobileBtn')).toHaveAttribute('aria-pressed','true');
 await page.locator('#clearBtn').click();
 await expect(page.locator('#pageTitle')).toHaveValue('');
 expect(await page.evaluate(()=>localStorage.getItem('serp-preview.draft.v2'))).toBeNull();
 await expect(page.locator('#rememberDraft')).not.toBeChecked();
});
test('clipboard and export',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await page.goto('/');
 await page.locator('#pageTitle').fill('Test & title');
 await page.locator('#copyTagsBtn').click();
 expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('Test &amp; title');
 const promise=page.waitForEvent('download');await page.locator('#downloadBtn').click();
 expect((await promise).suggestedFilename()).toBe('seo-meta-tags.html');
});
for(const width of [320,390,768,1440])test('reflow '+width,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/');
 await page.locator('#pageTitle').fill('বাংলা العربية '+ 'X'.repeat(250));
 await page.locator('#mobileBtn').click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
});
test('WCAG 2.2 automated scan',async({page})=>{
 await page.goto('/');
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
 expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
});
test('keyboard entry',async({page})=>{await page.goto('/');await page.keyboard.press('Tab');await expect(page.locator('.skip-link')).toBeFocused();await page.keyboard.press('Enter');await page.locator('#pageTitle').focus();await page.keyboard.type('Keyboard');await expect(page.locator('#previewTitle')).toContainText('Keyboard')});
test('crawl assets and headers',async({request})=>{
 const r=await request.get('/');expect(r.status()).toBe(200);expect(r.headers()['content-security-policy']).toContain("connect-src 'none'");
 for(const p of ['/robots.txt','/sitemap.xml','/assets/og-preview.png','/google89a2099889f25c35.html'])expect((await request.get(p)).status()).toBe(200);
 expect((await request.get('/missing-test-page-12345')).status()).toBe(404);
});

