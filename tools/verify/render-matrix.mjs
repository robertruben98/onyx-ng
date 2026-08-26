// W3-3 render harness: drives the built apps/docs site (served from a dist dir via request
// interception) through the REAL ThemeService path (localStorage -> class on <html>), then
// measures resolved --ui-* custom properties on each component host, painted colours/radii of
// every element in the demos, WCAG ratios of every text node, and takes screenshots.
// usage: node render-matrix.mjs <buildName> <distDir> <outDir> [placements=html,body]
import { createRequire } from 'module';
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'fs';
import { join, extname, basename } from 'path';
const require = createRequire(process.env.PLAYWRIGHT_NODE_MODULES ? process.env.PLAYWRIGHT_NODE_MODULES + '/' : import.meta.url); // needs a playwright install (PLAYWRIGHT_NODE_MODULES=<path>/node_modules when not a project dependency)
const { chromium } = require('playwright');
const [BUILD, DIST, OUT, PLACEMENTS = 'html,body', ONLY_IDS = '', OUTNAME = 'matrix.json', SHOTS_ALL = ''] = process.argv.slice(2);
const ALL_IDS = ['button','accordion','avatar','alert','card','badge','input','radio-group','data-table','popover','select','menu','progress-bar','spinner','checkbox','textarea','tabs','tooltip','divider','empty-state','tag','grid','dialog','slider','switch','stack'];
const IDS = ONLY_IDS ? ONLY_IDS.split(',') : ALL_IDS;
const THEMES = [
  { name: 'light', dark: false, preset: 'default' },
  { name: 'dark', dark: true, preset: 'default' },
  { name: 'acme', dark: false, preset: 'acme' },
  { name: 'dark-acme', dark: true, preset: 'acme' },
];
const OPEN = { // how to open the overlay in the FIRST demo
  dialog: async (p) => p.locator('.docs-demo__preview').first().locator('onyx-button button').first().click(),
  menu: async (p) => p.locator('.docs-demo__preview').first().locator('button').first().click(),
  popover: async (p) => p.locator('.docs-demo__preview').first().locator('button').first().click(),
  tooltip: async (p) => p.locator('.docs-demo__preview').first().locator('button').first().hover(),
  select: async (p) => p.locator('.docs-demo__preview').first().locator('onyx-select [role="combobox"], onyx-select button').first().click(),
};
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.txt':'text/plain' };
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = { build: BUILD, dist: DIST, placements: {} };

const MEASURE = ([id, placement]) => {
  if (placement === 'body') { const h = document.documentElement; for (const c of ['onyx-dark','onyx-theme-acme']) if (h.classList.contains(c)) { h.classList.remove(c); document.body.classList.add(c); } }
  // 1. every --ui-* name declared in a :root rule of the bundled stylesheet
  const names = new Set();
  for (const ss of document.styleSheets) { let rules; try { rules = ss.cssRules; } catch { continue; }
    for (const r of rules) if (r.selectorText && r.selectorText.split(',').map(s=>s.trim()).includes(':root')) for (const p of r.style) if (p.startsWith('--ui-')) names.add(p); }
  const previews = [...document.querySelectorAll('.docs-demo__preview')];
  const hostTag = 'onyx-' + id;
  let host = document.querySelector('.docs-demo__preview ' + hostTag) || previews[0]?.firstElementChild || previews[0];
  const overlay = document.querySelector('.cdk-overlay-container');
  const probe = document.createElement('span'); document.body.appendChild(probe);
  const isColor = (v) => { probe.style.color = ''; probe.style.color = v; return probe.style.color !== ''; };
  const hs = getComputedStyle(host);
  const vars = {}; const colorNames = [];
  for (const n of names) { const v = hs.getPropertyValue(n).trim(); vars[n] = v; if (isColor(v)) colorNames.push(n); }
  probe.remove();
  // 2. painted properties + contrast for every element in the demos (+ open overlay)
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const a = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number); return { r:a[0], g:a[1], b:a[2], a: a.length > 3 ? a[3] : 1 }; };
  const lum = ({r,g,b}) => { const f = (c) => { c/=255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); }; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
  const ratio = (f, b) => { const l1 = lum(f), l2 = lum(b); return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); };
  const blend = (top, under) => ({ r: top.r*top.a + under.r*(1-top.a), g: top.g*top.a + under.g*(1-top.a), b: top.b*top.a + under.b*(1-top.a), a: 1 });
  const effBg = (el) => { let acc = null; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (!c || c.a === 0) continue; if (!acc) acc = c; else acc = blend(acc, c); if (acc.a >= 1) return acc; } const page = parse(getComputedStyle(document.documentElement).backgroundColor); return acc ? blend(acc, page && page.a ? page : {r:255,g:255,b:255,a:1}) : (page && page.a ? page : {r:255,g:255,b:255,a:1}); };
  const pathOf = (el) => { const parts = []; for (let e = el, i = 0; e && i < 4 && !e.classList.contains('docs-demo__preview') && e !== overlay; e = e.parentElement, i++) parts.unshift(e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0,2).join('.') : '')); return parts.join('>'); };
  const scope = [...previews.flatMap(p => [...p.querySelectorAll('*')]), ...(overlay ? [...overlay.querySelectorAll('*')] : [])];
  const painted = []; const contrast = [];
  for (const el of scope) { if (painted.length > 600) break;
    const cs = getComputedStyle(el); const rect = el.getBoundingClientRect(); if (rect.width === 0 && rect.height === 0) continue;
    const bg = parse(cs.backgroundColor); const bw = parseFloat(cs.borderTopWidth) || 0; const text = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    if (!(bg && bg.a > 0) && bw === 0 && !text && cs.boxShadow === 'none' && cs.borderRadius === '0px') continue;
    painted.push({ path: pathOf(el), color: cs.color, bg: cs.backgroundColor, border: bw ? cs.borderTopColor : null, radius: cs.borderRadius, shadow: cs.boxShadow === 'none' ? null : cs.boxShadow.slice(0,60), outline: cs.outlineStyle !== 'none' ? cs.outlineColor : null, text: text.slice(0,24) || null, inOverlay: overlay ? overlay.contains(el) : false, w: Math.round(rect.width), h: Math.round(rect.height) });
    if (text) { const fg = parse(cs.color); const b = effBg(el); if (fg) contrast.push({ path: pathOf(el), text: text.slice(0,24), fg: cs.color, bg: `rgb(${Math.round(b.r)}, ${Math.round(b.g)}, ${Math.round(b.b)})`, ratio: Math.round(ratio(fg.a < 1 ? blend(fg, b) : fg, b) * 100) / 100, px: parseFloat(cs.fontSize), weight: cs.fontWeight }); }
  }
  const cards = [...document.querySelectorAll('.docs-demo__card')].slice(0, 3).map(c => c.getBoundingClientRect());
  const top = Math.min(...cards.map(c => c.top)) + window.scrollY, bottom = Math.max(...cards.map(c => c.bottom)) + window.scrollY;
  return { htmlClass: document.documentElement.className, bodyClass: document.body.className, hostTag: host?.tagName.toLowerCase(), hostClass: host?.className || '', names: [...names].length, colorNames, vars, painted, contrast, previews: previews.length, overlayChildren: overlay ? overlay.children.length : 0, clip: { x: 0, y: Math.max(0, top - 8), w: 1200, h: Math.min(1100, bottom - top + 16) } };
};

for (const placement of PLACEMENTS.split(',')) {
  results.placements[placement] = {};
  for (const th of THEMES) {
    const per = {}; results.placements[placement][th.name] = per;
    const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
    await ctx.addInitScript(([d, p]) => { localStorage.setItem('onyx-dark', String(d)); localStorage.setItem('onyx-preset', p); }, [th.dark, th.preset]);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
    await page.route('http://onyx.local/**', (route) => { const u = new URL(route.request().url()); let p = join(DIST, decodeURIComponent(u.pathname));
      if (!existsSync(p) || statSync(p).isDirectory()) { const b = join(DIST, basename(u.pathname)); p = existsSync(b) && !statSync(b).isDirectory() ? b : join(DIST, 'index.html'); }
      route.fulfill({ status: 200, contentType: MIME[extname(p)] || 'application/octet-stream', body: readFileSync(p) }); });
    for (const id of IDS) {
      try {
        await page.goto(`http://onyx.local/components/${id}`);
        await page.waitForSelector('.docs-demo__preview > *', { timeout: 20000, state: 'attached' });
        await page.addStyleTag({ content: '*{transition:none!important;animation:none!important;caret-color:transparent!important}' });
        await page.waitForTimeout(120);
        if (OPEN[id]) { try { await OPEN[id](page); await page.waitForTimeout(350); } catch (e) { errors.push(`open(${id}): ${String(e).slice(0, 120)}`); } }
        const r = await page.evaluate(MEASURE, [id, placement]);
        await page.waitForTimeout(80);
        if (placement === 'html' || SHOTS_ALL) {
          const dir = join(OUT, BUILD, placement === 'html' ? 'shots' : 'shots-' + placement, th.name); mkdirSync(dir, { recursive: true });
          if (r.overlayChildren > 0 && OPEN[id]) await page.screenshot({ path: join(dir, `${id}.png`) });
          else await page.screenshot({ path: join(dir, `${id}.png`), fullPage: true, clip: { x: r.clip.x, y: r.clip.y, width: r.clip.w, height: Math.max(60, r.clip.h) } });
        }
        per[id] = r;
        if (id === 'dialog') await page.keyboard.press('Escape');
      } catch (e) { per[id] = { error: String(e).slice(0, 300) }; }
    }
    per.__errors = errors.slice(0, 40);
    await ctx.close();
    console.log(`${BUILD} ${placement} ${th.name}: ${Object.keys(per).length - 1} pages, ${errors.length} console/page errors`);
  }
}
mkdirSync(join(OUT, BUILD), { recursive: true });
writeFileSync(join(OUT, BUILD, OUTNAME), JSON.stringify(results));
await browser.close();
console.log('DONE', BUILD);
