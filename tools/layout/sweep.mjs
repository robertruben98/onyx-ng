#!/usr/bin/env node
/**
 * Geometry sweep: the defect class the contrast matrix cannot see.
 *
 * Same rig as tools/contrast (built docs app, headless Chromium, every
 * component page), but it reads boxes instead of colours: for each component
 * at each viewport width it looks for
 *   collapsed-occupies   an intended-collapsed panel (aria-expanded=false ->
 *                        aria-controls, [hidden], [aria-hidden], zero-height
 *                        overflow wrapper) that still has a box, and how many
 *                        px of its text are visible through the clip;
 *   text-cut             text rects cut by an overflow:hidden/clip ancestor
 *                        (scrollable ancestors are reported as INFO);
 *   spill                boxes that extend past the demo container or the
 *                        viewport (horizontal page scroll is reported too);
 *   focus-ring-cut       a focus ring (outline or box-shadow spread) cut by an
 *                        overflow ancestor;
 *   overlap              two visible boxes that intersect while neither
 *                        contains the other (positioned overlays flagged);
 *   zero-size-focusable  a focusable element with no box (sr-only patterns
 *                        flagged as intended).
 * One screenshot per instance. Read-only on product source.
 *
 *   node tools/layout/sweep.mjs [--dist dist/docs] [--out tools/layout] [--shots <dir>]
 *        [--widths 1280,768,375] [--only accordion,dialog] [--pw-dir <dir>] [--chrome <path>] [--label <tree>]
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const ROOT = process.cwd();
const DIST = path.resolve(ROOT, opt("dist", fs.existsSync(path.join(ROOT, "dist/docs/browser")) ? "dist/docs/browser" : "dist/docs"));
const OUT = path.resolve(ROOT, opt("out", "tools/layout"));
const SHOTS = opt("shots", "") ? path.resolve(ROOT, opt("shots", "")) : null;
const WIDTHS = opt("widths", "1280,768,375").split(",").map(Number);
const ONLY = opt("only", "").split(",").filter(Boolean);
const PW_DIR = opt("pw-dir", process.env.PW_MODULE_DIR || ROOT);
const CHROME = opt("chrome", process.env.CHROME_PATH || "");
const LABEL = opt("label", null);

const COMPONENTS = ["accordion", "alert", "avatar", "badge", "button", "card", "checkbox", "data-table", "dialog", "divider", "empty-state", "grid", "input", "menu", "popover", "progress-bar", "radio-group", "select", "skeleton", "slider", "spinner", "stack", "switch", "tabs", "tag", "textarea", "tooltip"];
const OVERLAY = {
  dialog: { click: ".docs-demo__preview onyx-button button", wait: ".cdk-overlay-container [role='dialog']", close: "Escape" },
  menu: { click: ".docs-demo__preview onyx-menu button", wait: ".cdk-overlay-container [role='menu']", close: "Escape" },
  popover: { click: ".docs-demo__preview button", wait: ".cdk-overlay-container .cdk-overlay-pane > *", close: "Escape" },
  select: { click: ".docs-demo__preview [role='combobox']", wait: ".cdk-overlay-container [role='listbox']", close: "Escape" },
  tooltip: { hover: ".docs-demo__preview button", wait: ".cdk-overlay-container [role='tooltip']", close: "mouseaway" },
};

// ------------------------------------------------------------ server --------
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain" };
function skeletonFixture() {
  const require = createRequire(path.join(ROOT, "package.json"));
  const sass = require("sass");
  const scss = fs.readFileSync(path.join(ROOT, "libs/ui/components/skeleton/skeleton.component.scss"), "utf8");
  const css = sass.compileString(scss).css.replace(/:host\(([^)]+)\)/g, "onyx-skeleton$1").replace(/:host/g, "onyx-skeleton");
  const lines = (n) => Array.from({ length: n }, () => '<span class="ui-skeleton__line"></span>').join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/styles.css"><style>${css}</style></head>
<body><div class="docs-demo__preview" style="padding:24px;display:flex;gap:24px;align-items:center;flex-wrap:wrap">
<onyx-skeleton class="ui-skeleton--text" style="width:240px">${lines(3)}</onyx-skeleton>
<onyx-skeleton class="ui-skeleton--circle"><span class="ui-skeleton__block"></span></onyx-skeleton>
<onyx-skeleton class="ui-skeleton--rect" style="width:240px"><span class="ui-skeleton__block"></span></onyx-skeleton>
</div></body></html>`;
}
function serve(dist) {
  const index = fs.readFileSync(path.join(dist, "index.html"));
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    if (url === "/__fixture/skeleton") { res.writeHead(200, { "content-type": "text/html" }); return res.end(skeletonFixture()); }
    let file = path.join(dist, url);
    if (!(fs.existsSync(file) && fs.statSync(file).isFile())) file = path.join(dist, path.basename(url));
    if (url !== "/" && fs.existsSync(file) && fs.statSync(file).isFile()) { res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" }); return res.end(fs.readFileSync(file)); }
    res.writeHead(200, { "content-type": "text/html" }); res.end(index);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, base: `http://127.0.0.1:${server.address().port}` })));
}

// ---------------------------------------------------------- in-page ---------
function installInPage() {
  const R = (el) => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
  const round = (v) => Math.round(v * 10) / 10;
  const rr = (r) => ({ x: round(r.left + scrollX), y: round(r.top + scrollY), w: round(r.width), h: round(r.height) });
  const inter = (a, b) => { const l = Math.max(a.left, b.left), t = Math.max(a.top, b.top), r = Math.min(a.right, b.right), bt = Math.min(a.bottom, b.bottom); return { left: l, top: t, right: r, bottom: bt, width: Math.max(0, r - l), height: Math.max(0, bt - t) }; };
  const visible = (el) => { if (!(el instanceof Element)) return false; const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden") return false; const r = el.getBoundingClientRect(); return r.width > 0 || r.height > 0; };
  const short = (el) => { const cls = Array.from(el.classList).filter((c) => /^ui-|^cdk-|^docs-/.test(c)).slice(0, 2).join("."); return el.tagName.toLowerCase() + (cls ? "." + cls : ""); };
  const HOSTS = "onyx-accordion-item, onyx-accordion, onyx-alert, onyx-avatar, onyx-badge, onyx-button, onyx-card, onyx-checkbox, onyx-data-table, onyx-dialog, onyx-divider, onyx-empty-state, onyx-grid, onyx-input, onyx-menu, onyx-popover, onyx-progress-bar, onyx-radio-group, onyx-select, onyx-skeleton, onyx-slider, onyx-spinner, onyx-stack, onyx-switch, onyx-tabs, onyx-tab, onyx-tag, onyx-textarea, onyx-tooltip, .cdk-overlay-pane";
  const identity = (el) => {
    const host = el.closest(HOSTS);
    const hostTag = host ? host.tagName.toLowerCase() : "(page)";
    const mods = host ? Array.from(host.classList).filter((c) => /^ui-[\w-]+--[\w-]+$/.test(c)).join(".") : "";
    const own = Array.from(el.classList).filter((c) => /^ui-/.test(c)).slice(0, 2).join(".");
    const st = [];
    for (const a of ["aria-expanded", "aria-hidden", "hidden", "inert", "aria-selected", "aria-checked", "aria-disabled"]) { const v = el.getAttribute(a); if (v !== null) st.push(a + (v && v !== "true" ? "=" + v : "")); }
    if (el.matches(":disabled")) st.push("disabled");
    return `${hostTag}${mods ? "." + mods : ""}${el === host ? "" : " › " + el.tagName.toLowerCase() + (own ? "." + own : "")}${st.length ? " [" + st.join(",") + "]" : ""}`;
  };
  const pathOf = (el) => { const segs = []; let n = el; while (n && n !== document.body && segs.length < 6) { segs.unshift(short(n)); if (/^onyx-/i.test(n.tagName)) break; n = n.parentElement; } return segs.join(" > "); };
  const borders = (cs) => ({ t: parseFloat(cs.borderTopWidth) || 0, r: parseFloat(cs.borderRightWidth) || 0, b: parseFloat(cs.borderBottomWidth) || 0, l: parseFloat(cs.borderLeftWidth) || 0 });
  /** Clip rect imposed by overflow ancestors (not the viewport). */
  const clipOf = (el, stopAt) => {
    let rect = { left: -1e9, top: -1e9, right: 1e9, bottom: 1e9 }, by = null, kind = "visible";
    let n = el.parentElement;
    while (n && n !== document.documentElement && n !== stopAt) {
      const cs = getComputedStyle(n);
      const ox = cs.overflowX, oy = cs.overflowY;
      if (ox !== "visible" || oy !== "visible") {
        const r = R(n), b = borders(cs);
        if (ox !== "visible") { rect.left = Math.max(rect.left, r.left + b.l); rect.right = Math.min(rect.right, r.right - b.r); }
        if (oy !== "visible") { rect.top = Math.max(rect.top, r.top + b.t); rect.bottom = Math.min(rect.bottom, r.bottom - b.b); }
        if (!by) { by = n; kind = [ox, oy].includes("hidden") || [ox, oy].includes("clip") ? "hidden" : "scroll"; }
      }
      if (cs.position === "fixed") break;
      n = n.parentElement;
    }
    return { rect, by, kind };
  };
  const textNodes = (root) => { const out = []; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let t; while ((t = w.nextNode())) if (/\S/.test(t.nodeValue) && t.parentElement && !t.parentElement.closest("script,style")) out.push(t); return out; };
  const textRects = (t) => { const rg = document.createRange(); rg.selectNodeContents(t); return Array.from(rg.getClientRects()).filter((r) => r.width > 0 && r.height > 0); };
  const isFocusable = (el) => el.matches("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1']), [contenteditable]") && !el.matches(":disabled") && !el.closest("[inert]");
  const hasBoxPaint = (el) => { const cs = getComputedStyle(el); const b = borders(cs); const bg = cs.backgroundColor; const hasBg = bg && !/rgba\(\d+, \d+, \d+, 0\)/.test(bg) && bg !== "transparent"; return hasBg || b.t + b.r + b.b + b.l > 0 || el.tagName === "IMG" || el.tagName === "svg" || el.tagName === "INPUT"; };
  const hasText = (el) => Array.from(el.childNodes).some((n) => n.nodeType === 3 && /\S/.test(n.nodeValue));

  const findings = [];
  const push = (f) => findings.push(f);

  function sweep(rootSel, previewSel) {
    const roots = Array.from(document.querySelectorAll(rootSel));
    const previews = Array.from(document.querySelectorAll(previewSel));
    const containerOf = (el) => el.closest(previewSel) || el.closest(".cdk-overlay-pane") || document.body;
    const all = [];
    for (const root of roots) for (const el of [root, ...root.querySelectorAll("*")]) if (!(el.closest(".docs-demo__bar, .docs-demo__code, pre, code"))) all.push(el);
    const seen = new Set(all);

    // ---- collapsed panels ------------------------------------------------
    const collapsed = new Map(); // el -> reason
    for (const c of all) {
      if (c.getAttribute("aria-expanded") === "false" && c.getAttribute("aria-controls")) for (const id of c.getAttribute("aria-controls").split(/\s+/)) { const p = document.getElementById(id); if (p && seen.has(p)) collapsed.set(p, `aria-expanded=false on ${short(c)} → #${id}`); }
      if (c.hasAttribute("hidden") && !collapsed.has(c)) collapsed.set(c, "[hidden]");
      if (c.getAttribute("aria-hidden") === "true" && c.getAttribute("role") && !collapsed.has(c)) collapsed.set(c, "[aria-hidden=true][role]");
      if (c.hasAttribute("inert") && !collapsed.has(c)) collapsed.set(c, "[inert]");
    }
    // zero-height overflow wrappers with taller content
    for (const c of all) { const cs = getComputedStyle(c); if ((cs.overflowY === "hidden" || cs.overflowY === "clip") && R(c).height <= 1 && c.scrollHeight > 2 && !collapsed.has(c)) collapsed.set(c, "zero-height overflow:hidden wrapper"); }
    for (const [p, reason] of collapsed) {
      const cs = getComputedStyle(p);
      const r = R(p);
      const pad = { t: parseFloat(cs.paddingTop), b: parseFloat(cs.paddingBottom), l: parseFloat(cs.paddingLeft), r: parseFloat(cs.paddingRight) };
      const inner = p.children[0] ? getComputedStyle(p.children[0]) : null;
      let visibleText = 0, sampleText = "";
      for (const t of textNodes(p)) {
        const clip = clipOf(t.parentElement, null).rect;
        for (const tr of textRects(t)) { const v = inter(tr, clip); if (v.height > visibleText) { visibleText = v.height; sampleText = t.nodeValue.trim().slice(0, 40); } }
      }
      if (cs.display === "none" || (r.height <= 0.5 && r.width <= 0.5)) { window.__geoClean = (window.__geoClean || 0) + 1; push({ kind: "collapsed-clean", severity: "OK", element: identity(p), path: pathOf(p), reason, display: cs.display, box: rr(r) }); continue; } // truly gone
      const occupies = r.height;
      push({ kind: "collapsed-occupies", severity: visibleText > 1 ? "P1" : occupies > 2 ? "P2" : "INFO", element: identity(p), path: pathOf(p), reason,
        box: rr(r), occupies_px: round(occupies), visible_text_px: round(visibleText), sample_text: sampleText,
        panel_padding: pad, panel_min_height: cs.minHeight, inner_padding: inner ? `${inner.paddingTop} ${inner.paddingRight} ${inner.paddingBottom} ${inner.paddingLeft}` : null, inner_min_height: inner ? inner.minHeight : null,
        grid_template_rows: cs.gridTemplateRows, overflow: cs.overflow, display: cs.display, target: p });
    }

    // ---- text cut by overflow / spill ------------------------------------
    for (const el of all) {
      if (!visible(el) || Array.from(collapsed.keys()).some((p) => p === el || p.contains(el))) continue;
      const cont = containerOf(el);
      const cr = R(cont);
      const cs = getComputedStyle(el);
      // text rects vs overflow clip
      if (hasText(el)) {
        const clip = clipOf(el, null);
        if (clip.by) {
          for (const t of Array.from(el.childNodes).filter((n) => n.nodeType === 3 && /\S/.test(n.nodeValue))) {
            for (const tr of textRects(t)) {
              const cutL = Math.max(0, clip.rect.left - tr.left), cutR = Math.max(0, tr.right - clip.rect.right), cutT = Math.max(0, clip.rect.top - tr.top), cutB = Math.max(0, tr.bottom - clip.rect.bottom);
              const cut = Math.max(cutL, cutR, cutT, cutB);
              const vis = inter(tr, clip.rect);
              const fullyOut = vis.width <= 0 || vis.height <= 0;
              if (fullyOut && clip.kind === "scroll") continue; // scrolled out of view, not cut
              if (cut > 1) { push({ kind: "text-cut", fully_hidden: fullyOut, severity: clip.kind === "hidden" ? (fullyOut ? "P2" : cut >= tr.height * 0.5 || cutL + cutR > 4 ? "P1" : "P2") : "INFO", element: identity(el), path: pathOf(el), text: t.nodeValue.trim().slice(0, 40), box: rr(tr), clipped_by: short(clip.by), clip_kind: clip.kind, cut_px: { left: round(cutL), right: round(cutR), top: round(cutT), bottom: round(cutB) }, target: el }); break; }
            }
          }
        }
      }
      // element spills its demo container (horizontal) or the viewport
      if (cs.position !== "absolute" && cs.position !== "fixed" && cont !== document.body) {
        const r = R(el);
        const over = Math.max(0, r.right - cr.right), under = Math.max(0, cr.left - r.left);
        if ((over > 1 || under > 1) && r.width > 0) push({ kind: "spill", severity: over + under > 8 ? "P1" : "P2", element: identity(el), path: pathOf(el), box: rr(r), container: short(cont), container_box: rr(cr), spill_px: { right: round(over), left: round(under) }, white_space: cs.whiteSpace, min_width: cs.minWidth, target: el });
      }
      // horizontal content clipped or truncated inside the element itself
      if ((cs.overflowX === "hidden" || cs.overflowX === "clip") && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
        const nowrap = cs.whiteSpace === "nowrap" || cs.whiteSpace === "pre";
        const ellipsis = cs.textOverflow === "ellipsis";
        push({ kind: ellipsis ? "text-truncated" : "content-clipped", severity: ellipsis ? (el.getAttribute("title") || el.getAttribute("aria-label") ? "INFO" : "P2") : "P2", element: identity(el), path: pathOf(el), box: rr(R(el)), scroll_width: el.scrollWidth, client_width: el.clientWidth, hidden_px: round(el.scrollWidth - el.clientWidth), nowrap, ellipsis, has_title: !!(el.getAttribute("title") || el.getAttribute("aria-label")), text: (el.textContent || "").trim().slice(0, 40), target: el });
      } else if ((cs.overflowX === "auto" || cs.overflowX === "scroll") && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) {
        push({ kind: "scrollable-x", severity: "INFO", element: identity(el), path: pathOf(el), box: rr(R(el)), scroll_width: el.scrollWidth, client_width: el.clientWidth, hidden_px: round(el.scrollWidth - el.clientWidth), target: el });
      }
      const r2 = R(el);
      if (r2.right > innerWidth + 1 && r2.width > 0 && cs.position !== "fixed") push({ kind: "exceeds-viewport", severity: "P1", element: identity(el), path: pathOf(el), box: rr(r2), viewport: innerWidth, by_px: round(r2.right - innerWidth), target: el });
    }
    // page-level horizontal scroll
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) {
      const cw = document.documentElement.clientWidth;
      const offenders = Array.from(document.querySelectorAll("body *")).filter((e) => { const r = e.getBoundingClientRect(); return r.right > cw + 1 && r.width > 0 && getComputedStyle(e).position !== "fixed"; }).sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right).slice(0, 4);
      const inPreview = offenders.some((e) => e.closest(previewSel));
      push({ kind: "page-hscroll", severity: inPreview ? "P1" : "INFO", element: inPreview ? "(component)" : "(docs chrome)", path: "html", scroll_width: document.documentElement.scrollWidth, client_width: cw, offenders: offenders.map((e) => `${e.closest(previewSel) ? "preview:" : "chrome:"}${short(e)} right=${round(e.getBoundingClientRect().right)}`) });
    }

    // ---- overlaps -------------------------------------------------------
    const boxes = all.filter((el) => visible(el) && (hasText(el) || hasBoxPaint(el)) && !el.matches(".cdk-overlay-backdrop, .cdk-overlay-pane, .cdk-overlay-container, .cdk-global-overlay-wrapper, .cdk-overlay-connected-position-bounding-box") && !el.closest("[aria-hidden='true'][role], [hidden], [inert]") && !Array.from(collapsed.keys()).some((p) => p.contains(el)));
    // compare the VISIBLE part of each box: a virtual-scroll row clipped by its
    // viewport still has a rect, but it cannot overlap anything a user sees
    const rects = boxes.map((el) => { const r = R(el); const c = clipOf(el, null); return c.by ? inter(r, c.rect) : r; });
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      if (a.contains(b) || b.contains(a)) continue;
      if (rects[i].width <= 0 || rects[i].height <= 0 || rects[j].width <= 0 || rects[j].height <= 0) continue;
      const v = inter(rects[i], rects[j]);
      if (v.width <= 2 || v.height <= 2) continue;
      if (rects[i].width * rects[i].height === 0 || rects[j].width * rects[j].height === 0) continue;
      const pa = getComputedStyle(a).position, pb = getComputedStyle(b).position;
      const positioned = ["absolute", "fixed"].includes(pa) || ["absolute", "fixed"].includes(pb);
      // text-node-less wrappers overlapping their siblings' children are noise: require both to paint or carry text
      push({ kind: "overlap", severity: positioned ? "INFO" : "P2", element: identity(a), element_b: identity(b), path: pathOf(a), path_b: pathOf(b), box: rr(rects[i]), box_b: rr(rects[j]), overlap_px: { w: round(v.width), h: round(v.height) }, positioned, target: a });
    }

    // ---- zero-size focusables -------------------------------------------
    for (const el of all) {
      if (!isFocusable(el)) continue;
      const cs = getComputedStyle(el); if (cs.display === "none") continue;
      const r = R(el);
      if (r.width < 1 || r.height < 1) {
        const srOnly = cs.position === "absolute" && (cs.clip !== "auto" || cs.clipPath !== "none" || (r.width <= 1 && r.height <= 1)) && cs.overflow === "hidden";
        push({ kind: "zero-size-focusable", severity: srOnly ? "INFO" : "P2", element: identity(el), path: pathOf(el), box: rr(r), sr_only_pattern: srOnly, opacity: cs.opacity, target: el });
      }
    }
    return { previews: previews.length };
  }

  /** Focus ring geometry for one element (call after focusing it). */
  function ringCut(el) {
    const host = el.closest(HOSTS) || el;
    let n = el, ring = null;
    while (n) {
      const cs = getComputedStyle(n);
      if (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) { ring = { el: n, via: "outline", spread: parseFloat(cs.outlineWidth) + (parseFloat(cs.outlineOffset) || 0) }; break; }
      if (cs.boxShadow && cs.boxShadow !== "none") {
        // pick the largest reach among the shadows: |x|,|y| + blur + spread
        let reach = 0;
        for (const sh of cs.boxShadow.split(/,(?![^(]*\))/)) { const nums = sh.replace(/rgba?\([^)]*\)/g, "").trim().split(/\s+/).map(parseFloat).filter((v) => !isNaN(v)); if (nums.length >= 2) reach = Math.max(reach, Math.max(Math.abs(nums[0]), Math.abs(nums[1])) + (nums[2] || 0) + (nums[3] || 0)); }
        if (reach > 0) { ring = { el: n, via: "box-shadow", spread: reach }; break; }
      }
      if (n === host) break;
      n = n.parentElement;
    }
    if (!ring) return { element: identity(el), path: pathOf(el), ring: null, focus_visible: el.matches(":focus-visible") };
    const r = R(ring.el);
    const rr2 = { left: r.left - ring.spread, top: r.top - ring.spread, right: r.right + ring.spread, bottom: r.bottom + ring.spread };
    const clip = clipOf(ring.el, null);
    const cut = clip.by ? { left: Math.max(0, clip.rect.left - rr2.left), top: Math.max(0, clip.rect.top - rr2.top), right: Math.max(0, rr2.right - clip.rect.right), bottom: Math.max(0, rr2.bottom - clip.rect.bottom) } : { left: 0, top: 0, right: 0, bottom: 0 };
    const maxCut = Math.max(cut.left, cut.top, cut.right, cut.bottom);
    return { element: identity(el), path: pathOf(el), ring_on: short(ring.el), via: ring.via, spread_px: round(ring.spread), box: rr(r), clipped_by: clip.by ? short(clip.by) : null, clip_kind: clip.by ? clip.kind : null, cut_px: { left: round(cut.left), top: round(cut.top), right: round(cut.right), bottom: round(cut.bottom) }, max_cut_px: round(maxCut), focus_visible: el.matches(":focus-visible"), target: ring.el };
  }

  window.__geo = {
    run: (rootSel, previewSel) => { findings.length = 0; const meta = sweep(rootSel, previewSel); return { meta, findings: findings.map((f, i) => ({ ...f, target: undefined, _i: i })) }; },
    targetRect: (i) => { const f = findings[i]; if (!f || !f.target) return null; f.target.scrollIntoView({ block: "center", inline: "nearest" }); const r = f.target.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; },
    focusables: (sel) => Array.from(document.querySelectorAll(sel + " button, " + sel + " a[href], " + sel + " input, " + sel + " select, " + sel + " textarea, " + sel + " [tabindex]:not([tabindex='-1'])")).filter((el) => visible(el) && isFocusable(el)),
    ringCut,
    identity,
    previewWidth: (sel) => { const p = document.querySelector(sel); return p ? Math.round(p.getBoundingClientRect().width) : null; },
  };
}

// ------------------------------------------------------------ driver --------
async function loadPlaywright() {
  const req = createRequire(path.join(PW_DIR, "package.json"));
  try { return req("playwright-core"); } catch { /* */ }
  try { return req("playwright"); } catch { /* */ }
  throw new Error(`playwright-core not found under ${PW_DIR}; pass --pw-dir`);
}
async function main() {
  if (!fs.existsSync(path.join(DIST, "index.html"))) throw new Error(`No docs build at ${DIST}`);
  const pw = await loadPlaywright();
  const { server, base } = await serve(DIST);
  const launch = CHROME ? { executablePath: CHROME } : { channel: "chrome" };
  const browser = await pw.chromium.launch({ headless: true, ...launch }).catch(async (e) => { const fb = path.join(process.env.HOME || "", ".cache/ms-playwright/chromium-1208/chrome-linux64/chrome"); if (fs.existsSync(fb)) return pw.chromium.launch({ headless: true, executablePath: fb }); throw e; });
  const components = ONLY.length ? COMPONENTS.filter((c) => ONLY.includes(c)) : COMPONENTS;
  const PREVIEW = ".docs-demo__preview", OVL = ".cdk-overlay-container";
  const gitSha = (() => { try { return fs.readFileSync(path.join(ROOT, ".git/HEAD"), "utf8").trim(); } catch { return null; } })();
  const meta = { generated_by: "tools/layout/sweep.mjs", tree: LABEL || gitSha, dist: path.relative(ROOT, DIST), widths: WIDTHS, components: components.length, preview_widths: {}, checked: { elements: 0, focusables: 0, collapsed_panels: 0, text_nodes: 0 }, notes: [] };
  const all = [];
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  let shotN = 0;
  const record = async (page, component, width, state, res) => {
    for (const f of res.findings) {
      const row = { component, width, state, ...f };
      delete row._i;
      if (SHOTS && f.kind !== "page-hscroll" && f.severity !== "OK") {
        try {
          const r = await page.evaluate((i) => window.__geo.targetRect(i), f._i);
          if (r && r.w >= 0 && r.h >= 0) {
            await page.waitForTimeout(20);
            const pad = 14;
            const vw = page.viewportSize().width, vh = page.viewportSize().height;
            const clip = { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), width: Math.max(24, Math.min(vw, r.w + pad * 2)), height: Math.max(24, Math.min(vh, r.h + pad * 2)) };
            clip.width = Math.min(clip.width, vw - clip.x); clip.height = Math.min(clip.height, vh - clip.y);
            const name = `${String(++shotN).padStart(3, "0")}-${component}-${width}-${f.kind}.png`;
            await page.screenshot({ path: path.join(SHOTS, name), clip });
            row.shot = name;
          }
        } catch (e) { row.shot_error = e.message.split("\n")[0]; }
      }
      all.push(row);
    }
  };

  for (const component of components) {
    const url = component === "skeleton" ? `${base}/__fixture/skeleton` : `${base}/components/${component}`;
    process.stdout.write(component);
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: "light" });
      page.on("pageerror", (e) => meta.notes.push(`${component}/${width}: pageerror ${e.message.split("\n")[0]}`));
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForSelector(PREVIEW, { timeout: 15000 });
      await page.addStyleTag({ content: `*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}` });
      await page.evaluate(installInPage);
      await page.waitForTimeout(60);
      meta.preview_widths[`${component}@${width}`] = await page.evaluate((s) => window.__geo.previewWidth(s), PREVIEW);
      const stats = await page.evaluate((sel) => { const els = document.querySelectorAll(sel + " *"); let tn = 0; const w = document.createTreeWalker(document.querySelector(sel) || document.body, NodeFilter.SHOW_TEXT); while (w.nextNode()) tn++; return { elements: els.length, text_nodes: tn }; }, PREVIEW);
      meta.checked.elements += stats.elements; meta.checked.text_nodes += stats.text_nodes;
      // default state
      const res = await page.evaluate(({ a, b }) => window.__geo.run(a, b), { a: PREVIEW, b: PREVIEW });
      meta.checked.collapsed_panels += res.findings.filter((f) => f.kind === "collapsed-occupies" || f.kind === "collapsed-clean").length;
      meta.checked.collapsed_clean = (meta.checked.collapsed_clean || 0) + res.findings.filter((f) => f.kind === "collapsed-clean").length;
      await record(page, component, width, "default", res);
      // focus rings
      const handles = await page.evaluateHandle((sel) => window.__geo.focusables(sel), PREVIEW);
      const count = await handles.evaluate((a) => a.length);
      meta.checked.focusables += count;
      const seenIds = new Set();
      for (let i = 0; i < count; i++) {
        const el = await handles.evaluateHandle((a, i) => a[i], i);
        const id = await el.evaluate((e) => window.__geo.identity(e));
        if (seenIds.has(id)) continue; seenIds.add(id);
        await el.evaluate((e) => { e.scrollIntoView({ block: "center" }); e.focus({ focusVisible: true }); });
        await page.waitForTimeout(25);
        const rc = await el.evaluate((e) => window.__geo.ringCut(e));
        if (rc.ring === null) all.push({ component, width, state: "focus", kind: "no-focus-ring", severity: "P2", element: rc.element, path: rc.path, focus_visible: rc.focus_visible });
        else if (rc.max_cut_px > 0.5) {
          const allSides = ["left", "top", "right", "bottom"].every((k) => rc.cut_px[k] >= rc.spread_px);
          const row = { component, width, state: "focus", kind: "focus-ring-cut", severity: rc.clip_kind === "hidden" ? (allSides ? "P1" : "P2") : "INFO", ...rc };
          delete row.target;
          if (SHOTS) { try { const r = await el.evaluate((e) => { const t = e.getBoundingClientRect(); return { x: t.left, y: t.top, w: t.width, h: t.height }; }); const vw = width, vh = 900; const clip = { x: Math.max(0, r.x - 14), y: Math.max(0, r.y - 14), width: Math.min(vw - Math.max(0, r.x - 14), r.w + 28), height: Math.min(vh - Math.max(0, r.y - 14), r.h + 28) }; const name = `${String(++shotN).padStart(3, "0")}-${component}-${width}-focus-ring-cut.png`; await page.screenshot({ path: path.join(SHOTS, name), clip }); row.shot = name; } catch (e) { row.shot_error = e.message.split("\n")[0]; } }
          all.push(row);
        }
        await el.evaluate((e) => e.blur());
      }
      await handles.dispose();
      // overlays
      const ov = OVERLAY[component];
      if (ov) {
        try {
          if (ov.click) await page.locator(ov.click).first().click();
          if (ov.hover) await page.locator(ov.hover).first().hover();
          await page.waitForSelector(ov.wait, { timeout: 3000 });
          await page.waitForTimeout(80);
          const res2 = await page.evaluate(({ a, b }) => window.__geo.run(a, b), { a: OVL, b: PREVIEW });
          await record(page, component, width, "open", res2);
          if (ov.close === "Escape") await page.keyboard.press("Escape"); else await page.mouse.move(5, 5);
        } catch (e) { meta.notes.push(`${component}/${width}: overlay not measured (${e.message.split("\n")[0]})`); await page.keyboard.press("Escape").catch(() => {}); }
      }
      process.stdout.write(`  ${width}:${all.filter((r) => r.component === component && r.width === width).length}`);
      await page.close();
    }
    process.stdout.write("\n");
  }
  await browser.close(); server.close();
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "findings.json"), '{"meta":' + JSON.stringify(meta) + ',\n"findings":[\n' + all.map((r) => JSON.stringify(r)).join(",\n") + "\n]}\n");
  const c = (k) => all.filter((r) => r.kind === k).length;
  console.log(`\nfindings: ${all.length}  collapsed-occupies ${c("collapsed-occupies")}  text-cut ${c("text-cut")}  content-clipped ${c("content-clipped")}  text-truncated ${c("text-truncated")}  scrollable-x ${c("scrollable-x")}  spill ${c("spill")}  exceeds-viewport ${c("exceeds-viewport")}  page-hscroll ${c("page-hscroll")}  focus-ring-cut ${c("focus-ring-cut")}  no-focus-ring ${c("no-focus-ring")}  overlap ${c("overlap")}  zero-size-focusable ${c("zero-size-focusable")}`);
  console.log(`checked: ${JSON.stringify(meta.checked)}`);
  for (const n of meta.notes) console.log("note:", n);
  console.log(`wrote ${path.relative(ROOT, OUT)}/findings.json${SHOTS ? " + shots in " + path.relative(ROOT, SHOTS) : ""}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
