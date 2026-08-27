#!/usr/bin/env node
/**
 * Rendered contrast matrix for every Onyx component x theme context.
 *
 * Method (after Kevin's V3 harness, verify.md): build the docs app, serve it
 * statically, drive headless Chromium, toggle the theme class on <html>,
 * disable transitions, paint the demo preview with var(--ui-color-surface)
 * (emulating a host app) and read COMPUTED colours from the DOM. Every row
 * carries the token that produced each colour (attributed by matching the
 * element against the live stylesheets and resolving the candidate custom
 * properties until one equals the computed value) plus the static var()
 * chain from tokens.css / dark.css / acme.css, so the gate can name the
 * token, not just the pixel.
 *
 *   node tools/contrast/measure.mjs \
 *     [--dist dist/docs] [--out tools/contrast] [--only button,card] \
 *     [--contexts light,dark,acme,dark+acme] [--no-hover] [--no-focus] \
 *     [--pw-dir <dir whose node_modules has playwright-core>] [--chrome <path>] [--label <tree id>]
 *
 * Read-only on product source: consumes dist/docs/browser and the token CSS.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";

// ---------------------------------------------------------------- args ------
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const flag = (name) => args.includes(`--${name}`);
const ROOT = process.cwd();
const DIST = path.resolve(
  ROOT,
  opt(
    "dist",
    fs.existsSync(path.join(process.cwd(), "dist/docs/browser"))
      ? "dist/docs/browser"
      : "dist/docs",
  ),
);
const OUT = path.resolve(ROOT, opt("out", "tools/contrast"));
const ONLY = opt("only", "").split(",").filter(Boolean);
const CONTEXTS = opt("contexts", "light,dark,acme,dark+acme").split(",");
const DO_HOVER = !flag("no-hover");
const DO_FOCUS = !flag("no-focus");
const PW_DIR = opt("pw-dir", process.env.PW_MODULE_DIR || ROOT);
const CHROME = opt("chrome", process.env.CHROME_PATH || "");

const CONTEXT_CLASS = {
  light: "",
  dark: "onyx-dark",
  acme: "onyx-theme-acme",
  "dark+acme": "onyx-dark onyx-theme-acme",
};

const COMPONENTS = [
  "accordion",
  "alert",
  "avatar",
  "badge",
  "button",
  "card",
  "checkbox",
  "data-table",
  "dialog",
  "divider",
  "empty-state",
  "grid",
  "input",
  "menu",
  "popover",
  "progress-bar",
  "radio-group",
  "select",
  "skeleton",
  "slider",
  "spinner",
  "stack",
  "switch",
  "tabs",
  "tag",
  "textarea",
  "tooltip",
];

/**
 * Non-text targets whose contrast IS required by WCAG 1.4.11 (control
 * boundaries / state indicators that identify the component). Anything not
 * listed is measured but reported INFO (a decorative box, a card border, a
 * badge background - the adjacent text already identifies it).
 * Matched with Element.matches() against the measured element.
 */
const REQUIRED_NON_TEXT = {
  checkbox: [".ui-checkbox__el"],
  "radio-group": [".ui-radio__el"],
  switch: [".ui-switch__track"],
  slider: [".ui-slider__el"],
  "progress-bar": [".ui-progress__fill"],
  input: [".ui-input__el", ".ui-input__field"],
  textarea: [".ui-textarea__el"],
  select: [".ui-select__trigger"],
  tabs: [".ui-tabs__tab--active"],
  "data-table": [".ui-checkbox__el"],
};
/**
 * Text-node glyphs that are icons, not words (sort arrows, the select caret):
 * WCAG 1.4.11 non-text at 3:1, not 1.4.3 text at 4.5:1. Kept explicit so the
 * gate never fails a state glyph against the text threshold.
 */
const NON_TEXT_GLYPHS = [".ui-dt__sort-icon", ".ui-select__arrow"];
/** Components that are placeholders / separators: WCAG does not govern them (measured, reported EXEMPT). */
const DECORATIVE = { skeleton: true, divider: ["onyx-divider"] };

/** How to open the overlay of a component in its first demo. */
const OVERLAY = {
  dialog: {
    click: ".docs-demo__preview onyx-button button",
    wait: ".cdk-overlay-container [role='dialog']",
    close: "Escape",
  },
  menu: {
    click: ".docs-demo__preview onyx-menu button",
    wait: ".cdk-overlay-container [role='menu']",
    close: "Escape",
  },
  popover: {
    click: ".docs-demo__preview button",
    wait: ".cdk-overlay-container .ui-popover, .cdk-overlay-container [role='dialog'], .cdk-overlay-container .cdk-overlay-pane > *",
    close: "Escape",
  },
  select: {
    click: ".docs-demo__preview [role='combobox']",
    wait: ".cdk-overlay-container [role='listbox']",
    close: "Escape",
  },
  tooltip: {
    hover: ".docs-demo__preview button",
    wait: ".cdk-overlay-container [role='tooltip']",
    close: "mouseaway",
  },
};

// -------------------------------------------------------- token graph -------
function parseCss(file) {
  const css = fs.readFileSync(file, "utf8");
  const blocks = {};
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const sel = m[1].trim().split("\n").pop().trim();
    const decls = {};
    for (const d of m[2].split(";")) {
      const i = d.indexOf(":");
      if (i < 0) continue;
      const k = d.slice(0, i).trim();
      if (k.startsWith("--")) decls[k] = d.slice(i + 1).trim();
    }
    if (Object.keys(decls).length)
      blocks[sel] = Object.assign(blocks[sel] || {}, decls);
  }
  return blocks;
}
// The token/theme stylesheets are whatever the docs app ships (angular.json
// styles), parsed in cascade order; the class blocks are picked up wherever
// they are declared (hand-written themes/*.css or generated presets).
function docsStyles() {
  try {
    const ng = JSON.parse(
      fs.readFileSync(path.join(ROOT, "angular.json"), "utf8"),
    );
    return (ng.projects.docs.architect.build.options.styles || [])
      .map((s) => (typeof s === "string" ? s : s.input))
      .filter((s) => !s.includes("node_modules") && !s.startsWith("apps/"));
  } catch {
    return [
      "libs/ui/tokens/dist/tokens.css",
      "libs/ui/themes/dark.css",
      "libs/ui/themes/acme.css",
    ];
  }
}
const BLOCKS = {};
for (const f of docsStyles()) {
  const abs = path.join(ROOT, f);
  if (!fs.existsSync(abs)) continue;
  for (const [sel, decls] of Object.entries(parseCss(abs)))
    BLOCKS[sel] = Object.assign(BLOCKS[sel] || {}, decls);
}
const TOKENS = BLOCKS[":root"] || {};
const DARK = BLOCKS[".onyx-dark"] || {};
const ACME = BLOCKS[".onyx-theme-acme"] || {};
function tokenMap(context) {
  const cls = CONTEXT_CLASS[context] || "";
  // Cascade order follows angular.json styles: tokens.css, dark.css, acme.css.
  return Object.assign(
    {},
    TOKENS,
    cls.includes("onyx-dark") ? DARK : {},
    cls.includes("onyx-theme-acme") ? ACME : {},
  );
}
function staticChain(token, context) {
  const map = tokenMap(context);
  const chain = [];
  let cur = token;
  for (let i = 0; i < 12 && cur; i++) {
    chain.push(cur);
    const v = map[cur];
    if (v == null) return { chain, value: null };
    const ref = v.match(/^var\((--[\w-]+)\)$/);
    if (!ref) return { chain, value: v };
    cur = ref[1];
  }
  return { chain, value: null };
}

// ------------------------------------------------------- static server ------
function skeletonFixture(stylesHref) {
  const require = createRequire(path.join(ROOT, "package.json"));
  const sass = require("sass");
  const scss = fs.readFileSync(
    path.join(ROOT, "libs/ui/components/skeleton/skeleton.component.scss"),
    "utf8",
  );
  const css = sass
    .compileString(scss)
    .css.replace(/:host\(([^)]+)\)/g, "onyx-skeleton$1")
    .replace(/:host/g, "onyx-skeleton");
  const lines = (n) =>
    Array.from(
      { length: n },
      () => '<span class="ui-skeleton__line"></span>',
    ).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="${stylesHref}"><style>${css}</style></head>
<body><div class="docs-demo__preview" style="padding:24px;display:flex;gap:24px;align-items:center">
<onyx-skeleton class="ui-skeleton--text" style="width:240px">${lines(3)}</onyx-skeleton>
<onyx-skeleton class="ui-skeleton--circle"><span class="ui-skeleton__block"></span></onyx-skeleton>
<onyx-skeleton class="ui-skeleton--rect" style="width:240px"><span class="ui-skeleton__block"></span></onyx-skeleton>
</div></body></html>`;
}
const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
};
function serve(dist) {
  const index = fs.readFileSync(path.join(dist, "index.html"));
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    if (url === "/__fixture/skeleton") {
      res.writeHead(200, { "content-type": "text/html" });
      return res.end(skeletonFixture("/styles.css"));
    }
    // index.html has no <base href>, so nested routes request assets
    // relatively (/components/runtime.js): fall back to the dist root.
    let file = path.join(dist, url);
    if (!(fs.existsSync(file) && fs.statSync(file).isFile()))
      file = path.join(dist, path.basename(url));
    if (url !== "/" && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, {
        "content-type": MIME[path.extname(file)] || "application/octet-stream",
      });
      return res.end(fs.readFileSync(file));
    }
    res.writeHead(200, { "content-type": "text/html" });
    res.end(index);
  });
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () =>
      resolve({ server, base: `http://127.0.0.1:${server.address().port}` }),
    ),
  );
}

// ------------------------------------------------------ in-page library -----
/* Evaluated in the browser. Everything below must be self-contained. */
function installInPage(config) {
  const { requiredSelectors, decorative, glyphSelectors } = config;
  const parseColor = (s) => {
    if (!s || s === "transparent") return [0, 0, 0, 0];
    let m = s.match(
      /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)/,
    );
    if (m) {
      let a =
        m[4] == null
          ? 1
          : m[4].endsWith("%")
            ? parseFloat(m[4]) / 100
            : parseFloat(m[4]);
      return [+m[1], +m[2], +m[3], a];
    }
    m = s.match(/^#([0-9a-f]{3,8})$/i);
    if (m) {
      let h = m[1];
      if (h.length <= 4)
        h = h
          .split("")
          .map((c) => c + c)
          .join("");
      const n = parseInt(h.slice(0, 6), 16);
      const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
    }
    // Named colours / other syntaxes: let the browser normalise.
    const probe = document.createElement("span");
    probe.style.color = s;
    document.body.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c && c !== s ? parseColor(c) : [0, 0, 0, 0];
  };
  const over = (top, bottom) => {
    const a = top[3];
    return [
      top[0] * a + bottom[0] * (1 - a),
      top[1] * a + bottom[1] * (1 - a),
      top[2] * a + bottom[2] * (1 - a),
      1,
    ];
  };
  const hex = (c) =>
    "#" +
    [0, 1, 2]
      .map((i) => Math.round(c[i]).toString(16).padStart(2, "0"))
      .join("");
  const lum = (c) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const ratio = (fg, bg) => {
    const l1 = lum(fg),
      l2 = lum(bg);
    return (
      Math.round(
        ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100,
      ) / 100
    );
  };
  const same = (a, b) =>
    a &&
    b &&
    Math.abs(a[0] - b[0]) <= 1 &&
    Math.abs(a[1] - b[1]) <= 1 &&
    Math.abs(a[2] - b[2]) <= 1 &&
    Math.abs(a[3] - b[3]) < 0.02;

  const visible = (el) => {
    if (!(el instanceof Element)) return false;
    if (el.closest("script,style,noscript")) return false;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility !== "visible") return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    let n = el;
    while (n && n !== document.documentElement) {
      if (parseFloat(getComputedStyle(n).opacity) === 0) return false;
      n = n.parentElement;
    }
    return true;
  };

  // All style rules, flattened (grouping rules descended), in cascade order.
  let RULES = null,
    SHEETS = -1;
  const rules = () => {
    if (RULES && SHEETS === document.styleSheets.length) return RULES;
    SHEETS = document.styleSheets.length;
    RULES = [];
    const walk = (list) => {
      for (const r of Array.from(list || [])) {
        if (r.cssRules && !(r instanceof CSSStyleRule)) walk(r.cssRules);
        else if (r instanceof CSSStyleRule) RULES.push(r);
      }
    };
    for (const s of Array.from(document.styleSheets)) {
      try {
        walk(s.cssRules);
      } catch {
        /* cross-origin */
      }
    }
    return RULES;
  };
  const LONGHANDS = {
    color: ["color"],
    "background-color": ["background-color", "background"],
    "border-color": [
      "border-color",
      "border",
      "border-top-color",
      "border-top",
      "border-bottom-color",
      "border-bottom",
      "border-left-color",
      "border-left",
      "border-right-color",
      "border-right",
    ],
    "outline-color": ["outline-color", "outline"],
    "box-shadow": ["box-shadow"],
    fill: ["fill"],
    "accent-color": ["accent-color"],
  };
  const tokensIn = (v) =>
    Array.from(v.matchAll(/var\(\s*(--[\w-]+)/g)).map((m) => m[1]);
  /** Candidate token declarations for a property on el (own rules only). */
  const declared = (el, prop, pseudo) => {
    const out = [];
    for (const r of rules()) {
      let sel = r.selectorText;
      if (pseudo) {
        if (!sel.includes(pseudo)) continue;
        sel = sel
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.endsWith(pseudo))
          .map((s) => s.slice(0, -pseudo.length))
          .join(",");
        if (!sel) continue;
      }
      let matches = false;
      try {
        matches = el.matches(sel);
      } catch {
        continue;
      }
      if (!matches) continue;
      for (const p of LONGHANDS[prop] || [prop]) {
        const v = r.style.getPropertyValue(p);
        if (v && v.includes("var(--"))
          out.push({
            tokens: tokensIn(v),
            raw: v.trim(),
            selector: r.selectorText,
          });
      }
    }
    return out;
  };
  /** Which declared token actually produced `computed` on el. */
  const attribute = (el, prop, computed, pseudo) => {
    const cs = getComputedStyle(el);
    const cands = declared(el, prop, pseudo);
    let winner = null;
    for (const c of cands) {
      for (const t of c.tokens) {
        const v = cs.getPropertyValue(t).trim();
        if (v && same(parseColor(v), computed))
          winner = { token: t, raw: c.raw, selector: c.selector };
      }
    }
    if (winner) return { ...winner, source: "rule" };
    if (cands.length)
      return {
        token: null,
        raw: cands[cands.length - 1].raw,
        selector: cands[cands.length - 1].selector,
        source: "rule-unresolved",
      };
    return null;
  };
  /** Inherited colour: walk up until a rule declares it. */
  const attributeInherited = (el, computed) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const a = attribute(n, "color", computed);
      if (a)
        return { ...a, source: n === el ? a.source : "inherited:" + short(n) };
      n = n.parentElement;
    }
    return { token: null, raw: null, selector: null, source: "none" };
  };
  const short = (el) => {
    const cls = Array.from(el.classList)
      .filter((c) => /^ui-|^cdk-|^docs-/.test(c))
      .slice(0, 2)
      .join(".");
    return el.tagName.toLowerCase() + (cls ? "." + cls : "");
  };
  /** Effective background: composite own + ancestors until opaque. */
  const effectiveBg = (el, skipSelf) => {
    const layers = [];
    let n = skipSelf ? el.parentElement : el;
    while (n) {
      const c = parseColor(getComputedStyle(n).backgroundColor);
      if (c[3] > 0) {
        layers.push({ el: n, color: c });
        if (c[3] >= 1) break;
      }
      n = n.parentElement;
    }
    let acc = [255, 255, 255, 1]; // browser canvas
    let base = null;
    for (let i = layers.length - 1; i >= 0; i--) {
      acc = over(layers[i].color, acc);
      if (!base) base = layers[i].el;
    }
    // Attribute: base opaque layer's token, plus any translucent layers.
    const parts = [];
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      const a = attribute(l.el, "background-color", l.color);
      parts.push(
        a && a.token
          ? a.token
          : "(" +
              hex(l.color) +
              (l.color[3] < 1 ? "/" + l.color[3].toFixed(2) : "") +
              " on " +
              short(l.el) +
              ")",
      );
    }
    return {
      color: acc,
      token: parts.length === 1 ? parts[0] : parts.reverse().join(" over "),
      layers: layers.length,
    };
  };
  const identity = (el, extra) => {
    let host = el.closest(
      "[data-onyx-host], onyx-accordion, onyx-alert, onyx-avatar, onyx-badge, onyx-button, onyx-card, onyx-checkbox, onyx-data-table, onyx-dialog, onyx-divider, onyx-empty-state, onyx-grid, onyx-input, onyx-menu, onyx-popover, onyx-progress-bar, onyx-radio-group, onyx-select, onyx-skeleton, onyx-slider, onyx-spinner, onyx-stack, onyx-switch, onyx-tabs, onyx-tag, onyx-textarea, onyx-tooltip, [class^='ui-'][class*='--'], .cdk-overlay-pane",
    );
    const hostTag = host ? host.tagName.toLowerCase() : "(page)";
    const mods = host
      ? Array.from(host.classList)
          .filter((c) => /^ui-[\w-]+--[\w-]+$/.test(c))
          .join(" ")
      : "";
    const own = Array.from(el.classList)
      .filter((c) => /^ui-/.test(c))
      .slice(0, 2)
      .join(".");
    const states = [];
    if (
      el.matches(":disabled") ||
      el.closest("[disabled], [aria-disabled='true'], [class*='--disabled']")
    )
      states.push("disabled");
    for (const a of [
      "aria-selected",
      "aria-checked",
      "aria-expanded",
      "aria-current",
      "aria-invalid",
      "aria-pressed",
    ]) {
      const v =
        el.getAttribute(a) ||
        (el.closest("[" + a + "]") &&
          el.closest("[" + a + "]").getAttribute(a));
      if (v && v !== "false")
        states.push(a.replace("aria-", "") + (v === "true" ? "" : "=" + v));
    }
    if (el.matches(":checked")) states.push("checked");
    if (el.matches("[placeholder]") && !el.value) states.push("empty");
    const tag =
      el === host
        ? ""
        : " › " + el.tagName.toLowerCase() + (own ? "." + own : "");
    return (
      hostTag +
      (mods ? "." + mods.replace(/ /g, ".") : "") +
      tag +
      (states.length ? " [" + states.join(",") + "]" : "") +
      (extra ? " " + extra : "")
    ).trim();
  };
  const pathOf = (el) => {
    const segs = [];
    let n = el;
    while (n && n !== document.body && segs.length < 5) {
      segs.unshift(short(n));
      if (/^onyx-/i.test(n.tagName)) break;
      n = n.parentElement;
    }
    return segs.join(" > ");
  };
  const isDisabled = (el) =>
    !!(
      el.matches(":disabled") ||
      el.closest("[disabled], [aria-disabled='true'], [class*='--disabled']")
    );
  const isRequired = (el) =>
    requiredSelectors.some((s) => {
      try {
        return el.matches(s.replace(/::[\w-]+$/, ""));
      } catch {
        return false;
      }
    });
  const isDecorative = (el) =>
    decorative === true ||
    (Array.isArray(decorative) &&
      decorative.some((s) => {
        try {
          return el.matches(s.replace(/::[\w-]+$/, ""));
        } catch {
          return false;
        }
      }));
  const fontInfo = (cs) => {
    const px = parseFloat(cs.fontSize);
    const w =
      parseInt(cs.fontWeight, 10) || (cs.fontWeight === "bold" ? 700 : 400);
    return { px, weight: w, large: px >= 24 || (px >= 18.66 && w >= 700) };
  };

  const textRow = (el, state, pseudo) => {
    const cs = getComputedStyle(el, pseudo || null);
    const fgRaw = parseColor(cs.color);
    if (fgRaw[3] === 0) return null;
    const bg = effectiveBg(el, false);
    const fg = fgRaw[3] < 1 ? over(fgRaw, bg.color) : fgRaw;
    const fgA = pseudo
      ? attribute(el, "color", fgRaw, pseudo) || {
          token: null,
          raw: null,
          source: "none",
        }
      : attributeInherited(el, fgRaw);
    const f = fontInfo(cs);
    const disabled = isDisabled(el);
    const glyph =
      !pseudo &&
      glyphSelectors.some((g) => {
        try {
          return el.matches(g);
        } catch {
          return false;
        }
      });
    if (glyph) {
      return {
        kind: "non-text",
        subkind: "glyph",
        state,
        required: true,
        decorative: false,
        element: identity(el, "glyph"),
        path: pathOf(el),
        text: (el.textContent || "").trim().slice(0, 10),
        fg_token: fgA.token,
        fg_decl: fgA.raw,
        fg_source: fgA.source,
        fg_rendered: hex(fg),
        bg_token: bg.token,
        bg_rendered: hex(bg.color),
        ratio: ratio(fg, bg.color),
        font_px: f.px,
        font_weight: f.weight,
        large: false,
        disabled,
      };
    }
    return {
      kind: "text",
      subkind: pseudo ? "placeholder" : "text",
      state,
      element: identity(el, pseudo ? "::placeholder" : ""),
      path: pathOf(el),
      text: pseudo
        ? el.getAttribute("placeholder")
        : (el.textContent || "").trim().slice(0, 40),
      fg_token: fgA.token,
      fg_decl: fgA.raw,
      fg_source: fgA.source,
      fg_rendered: hex(fg),
      bg_token: bg.token,
      bg_rendered: hex(bg.color),
      ratio: ratio(fg, bg.color),
      font_px: f.px,
      font_weight: f.weight,
      large: f.large,
      disabled,
    };
  };
  const nonTextRows = (el, state) => {
    const rows = [];
    const cs = getComputedStyle(el);
    const outer = effectiveBg(el, true);
    const ownBg = parseColor(cs.backgroundColor);
    const disabled = isDisabled(el);
    const req = isRequired(el);
    const deco = isDecorative(el);
    const base = {
      state,
      path: pathOf(el),
      disabled,
      required: req,
      decorative: deco,
    };
    // Border (any side) vs outer background.
    const sides = ["Top", "Right", "Bottom", "Left"];
    const drawn = sides.filter(
      (s) =>
        parseFloat(cs["border" + s + "Width"]) > 0 &&
        cs["border" + s + "Style"] !== "none" &&
        parseColor(cs["border" + s + "Color"])[3] > 0,
    );
    const attributeBorder = (c0) => {
      const a = attribute(el, "border-color", c0);
      if (a) return a;
      if (same(c0, parseColor(cs.color))) {
        const ai = attributeInherited(el, c0);
        return {
          ...ai,
          source:
            "currentColor" +
            (ai.source.startsWith("inherited") ? "/" + ai.source : ""),
        };
      }
      return { token: null, raw: null, source: "none" };
    };
    const byColor = new Map();
    for (const s of drawn) {
      const k = cs["border" + s + "Color"];
      if (!byColor.has(k)) byColor.set(k, []);
      byColor.get(k).push(s);
    }
    for (const [k, sidesOf] of byColor) {
      const c0 = parseColor(k);
      const c = c0[3] < 1 ? over(c0, outer.color) : c0;
      const a = attributeBorder(c0);
      const sk =
        sidesOf.length === 4
          ? "border"
          : "border-" + sidesOf.map((s) => s[0].toLowerCase()).join("");
      rows.push({
        ...base,
        kind: "non-text",
        subkind: sk,
        element: identity(el, sk),
        fg_token: a.token,
        fg_decl: a.raw,
        fg_source: a.source,
        fg_rendered: hex(c),
        bg_token: outer.token,
        bg_rendered: hex(outer.color),
        ratio: ratio(c, outer.color),
      });
      if (ownBg[3] > 0 && !same(over(ownBg, outer.color), outer.color)) {
        const inner = over(ownBg, outer.color);
        const ab = attribute(el, "background-color", ownBg) || { token: null };
        rows.push({
          ...base,
          kind: "non-text",
          subkind: sk + "-vs-own-bg",
          element: identity(el, sk + "/inner"),
          fg_token: a.token,
          fg_decl: a.raw,
          fg_source: a.source,
          fg_rendered: hex(c),
          bg_token: ab.token,
          bg_rendered: hex(inner),
          ratio: ratio(c, inner),
        });
      }
    }
    // Own background as a shape vs outer background (fill).
    if (ownBg[3] > 0) {
      const fill = over(ownBg, outer.color);
      if (!same(fill, outer.color)) {
        const a = attribute(el, "background-color", ownBg) || {
          token: null,
          raw: null,
          source: "none",
        };
        const hasText = /\S/.test(el.textContent || "");
        rows.push({
          ...base,
          kind: "non-text",
          subkind: hasText ? "box" : "fill",
          element: identity(el, hasText ? "box" : "fill"),
          fg_token: a.token,
          fg_decl: a.raw,
          fg_source: a.source,
          fg_rendered: hex(fill),
          bg_token: outer.token,
          bg_rendered: hex(outer.color),
          ratio: ratio(fill, outer.color),
        });
      }
    }
    // Focus ring: outline or box-shadow when focused.
    if (state === "focus") {
      let ringColor = null,
        a = null,
        via = null,
        ringEl = el;
      const host = el.closest("[class*='ui-']")
        ? el.closest(
            "onyx-input, onyx-textarea, onyx-select, onyx-switch, onyx-checkbox, onyx-slider, onyx-radio-group",
          ) || el
        : el;
      let n = el;
      while (n && !ringColor) {
        const ncs = getComputedStyle(n);
        if (ncs.outlineStyle !== "none" && parseFloat(ncs.outlineWidth) > 0) {
          ringColor = parseColor(ncs.outlineColor);
          a = attribute(n, "outline-color", ringColor);
          via = "outline";
          ringEl = n;
        } else if (ncs.boxShadow && ncs.boxShadow !== "none") {
          const m = ncs.boxShadow.match(/rgba?\([^)]+\)/);
          if (m) {
            ringColor = parseColor(m[0]);
            a = attribute(n, "box-shadow", ringColor);
            via = "box-shadow" + (n === el ? "" : " on " + short(n));
            ringEl = n;
          }
        }
        if (n === host) break;
        n = n.parentElement;
      }
      if (ringEl !== el) {
        outer.color = effectiveBg(ringEl, true).color;
        outer.token = effectiveBg(ringEl, true).token;
      }
      if (ringColor && ringColor[3] > 0) {
        const c = ringColor[3] < 1 ? over(ringColor, outer.color) : ringColor;
        a = a || { token: null, raw: null, source: "none" };
        rows.push({
          ...base,
          required: true,
          kind: "non-text",
          subkind: "focus-ring",
          element: identity(el, "focus-ring/" + via),
          fg_token: a.token,
          fg_decl: a.raw,
          fg_source: a.source,
          fg_rendered: hex(c),
          bg_token: outer.token,
          bg_rendered: hex(outer.color),
          ratio: ratio(c, outer.color),
        });
        if (ownBg[3] > 0 && !same(over(ownBg, outer.color), outer.color)) {
          const inner = over(ownBg, outer.color);
          rows.push({
            ...base,
            required: false,
            kind: "non-text",
            subkind: "focus-ring-vs-control",
            element: identity(el, "focus-ring/vs-control"),
            fg_token: a.token,
            fg_decl: a.raw,
            fg_source: a.source,
            fg_rendered: hex(c),
            bg_token:
              (attribute(el, "background-color", ownBg) || {}).token || null,
            bg_rendered: hex(inner),
            ratio: ratio(c, inner),
          });
        }
      } else {
        rows.push({
          ...base,
          required: true,
          kind: "non-text",
          subkind: "focus-ring",
          element: identity(el, "focus-ring/NONE"),
          fg_token: null,
          fg_rendered: null,
          bg_token: outer.token,
          bg_rendered: hex(outer.color),
          ratio: null,
          focus_visible: el.matches(":focus-visible"),
        });
      }
    }
    // ::before / ::after shapes (divider lines, switch thumb).
    for (const ps of ["::before", "::after"]) {
      const pcs = getComputedStyle(el, ps);
      if (
        !pcs ||
        pcs.content === "none" ||
        pcs.content === "" ||
        pcs.display === "none"
      )
        continue;
      const behind = effectiveBg(el, false); // the pseudo sits on top of el's own background
      const pb = parseColor(pcs.backgroundColor);
      const pd = sides.filter(
        (s) =>
          parseFloat(pcs["border" + s + "Width"]) > 0 &&
          pcs["border" + s + "Style"] !== "none" &&
          parseColor(pcs["border" + s + "Color"])[3] > 0,
      );
      if (pd.length) {
        const c0 = parseColor(pcs["border" + pd[0] + "Color"]);
        const c = c0[3] < 1 ? over(c0, behind.color) : c0;
        const a = attribute(el, "border-color", c0, ps) || {
          token: null,
          raw: null,
          source: "none",
        };
        rows.push({
          ...base,
          kind: "non-text",
          subkind: "line",
          element: identity(el, ps + " border"),
          fg_token: a.token,
          fg_decl: a.raw,
          fg_source: a.source,
          fg_rendered: hex(c),
          bg_token: behind.token,
          bg_rendered: hex(behind.color),
          ratio: ratio(c, behind.color),
        });
      }
      if (pb[3] > 0) {
        const fill = over(pb, behind.color);
        if (!same(fill, behind.color)) {
          const a = attribute(el, "background-color", pb, ps) || {
            token: null,
            raw: null,
            source: "none",
          };
          rows.push({
            ...base,
            kind: "non-text",
            subkind: "fill",
            element: identity(el, ps + " fill"),
            fg_token: a.token,
            fg_decl: a.raw,
            fg_source: a.source,
            fg_rendered: hex(fill),
            bg_token: behind.token,
            bg_rendered: hex(behind.color),
            ratio: ratio(fill, behind.color),
          });
        }
      }
    }
    // Native checkbox / radio: the UA paints the checked box in accent-color.
    if (
      el.tagName === "INPUT" &&
      (el.type === "checkbox" || el.type === "radio") &&
      cs.appearance !== "none"
    ) {
      const acc = parseColor(cs.accentColor);
      if (acc[3] > 0) {
        const a = attribute(el, "accent-color", acc) || {
          token: null,
          raw: null,
          source: "none",
        };
        rows.push({
          ...base,
          kind: "non-text",
          subkind: "accent",
          element: identity(el, "accent-color (UA-drawn checked fill)"),
          fg_token: a.token,
          fg_decl: a.raw,
          fg_source: a.source,
          fg_rendered: hex(acc),
          bg_token: outer.token,
          bg_rendered: hex(outer.color),
          ratio: ratio(acc, outer.color),
        });
      }
    }
    // Range input: track/thumb live in vendor pseudo-elements getComputedStyle cannot
    // expose, so resolve the DECLARED tokens at the element (token-resolved, not painted).
    if (el.tagName === "INPUT" && el.type === "range") {
      const resolved = {};
      for (const ps of [
        "::-webkit-slider-runnable-track",
        "::-webkit-slider-thumb",
      ]) {
        const short = ps === "::-webkit-slider-thumb" ? "thumb" : "track";
        for (const prop of ["background-color", "border-color", "box-shadow"]) {
          const decls = declared(el, prop, ps);
          if (!decls.length) continue;
          const d = decls[decls.length - 1];
          for (const t of d.tokens) {
            const v = cs.getPropertyValue(t).trim();
            const c0 = parseColor(v);
            if (c0[3] === 0) continue;
            const c = c0[3] < 1 ? over(c0, outer.color) : c0;
            resolved[short + ":" + prop] = { token: t, color: c };
            rows.push({
              ...base,
              kind: "non-text",
              subkind: short + (prop === "background-color" ? "" : "-" + prop),
              element: identity(el, ps + " " + prop),
              fg_token: t,
              fg_decl: d.raw,
              fg_source: "token-resolved" + ps,
              fg_rendered: hex(c),
              bg_token: outer.token,
              bg_rendered: hex(outer.color),
              ratio: ratio(c, outer.color),
            });
          }
        }
      }
      if (
        resolved["thumb:background-color"] &&
        resolved["track:background-color"]
      ) {
        const th = resolved["thumb:background-color"],
          tr = resolved["track:background-color"];
        rows.push({
          ...base,
          kind: "non-text",
          subkind: "thumb-vs-track",
          element: identity(el, "thumb vs track"),
          fg_token: th.token,
          fg_source: "token-resolved",
          fg_rendered: hex(th.color),
          bg_token: tr.token,
          bg_rendered: hex(tr.color),
          ratio: ratio(th.color, tr.color),
        });
      }
    }
    // SVG glyph (currentColor / fill) vs its background.
    if (el instanceof SVGElement && el.tagName.toLowerCase() === "svg") {
      const shape = el.querySelector(
        "path, circle, rect, line, polyline, polygon, ellipse",
      );
      const scs = shape ? getComputedStyle(shape) : cs;
      const paint =
        scs.fill && scs.fill !== "none"
          ? scs.fill
          : scs.stroke && scs.stroke !== "none"
            ? scs.stroke
            : "none";
      const fillRaw = paint !== "none" ? parseColor(paint) : [0, 0, 0, 0];
      const useColor = same(fillRaw, parseColor(cs.color));
      if (fillRaw[3] > 0) {
        const bgc = effectiveBg(el, false);
        const c = fillRaw[3] < 1 ? over(fillRaw, bgc.color) : fillRaw;
        const a = useColor
          ? attributeInherited(el, fillRaw)
          : attribute(el, "fill", fillRaw) || {
              token: null,
              raw: null,
              source: "none",
            };
        rows.push({
          ...base,
          kind: "non-text",
          subkind: "icon",
          element: identity(el, "icon"),
          fg_token: a.token,
          fg_decl: a.raw,
          fg_source: a.source,
          fg_rendered: hex(c),
          bg_token: bgc.token,
          bg_rendered: hex(bgc.color),
          ratio: ratio(c, bgc.color),
        });
      }
    }
    return rows;
  };

  const collect = (roots, state) => {
    const rows = [];
    const seen = new Set();
    for (const root of roots) {
      const all = [root, ...root.querySelectorAll("*")];
      for (const el of all) {
        if (!visible(el) || seen.has(el)) continue;
        seen.add(el);
        if (el.closest(".docs-demo__bar, .docs-demo__code, pre, code"))
          continue;
        // Text: direct non-blank text nodes, or form value / placeholder.
        const hasText = Array.from(el.childNodes).some(
          (n) => n.nodeType === 3 && /\S/.test(n.nodeValue),
        );
        if (hasText) {
          const r = textRow(el, state);
          if (r) rows.push(r);
        }
        if (
          (el.tagName === "INPUT" || el.tagName === "TEXTAREA") &&
          el.type !== "checkbox" &&
          el.type !== "radio" &&
          el.type !== "range"
        ) {
          if (el.value) {
            const r = textRow(el, state);
            if (r) rows.push(r);
          }
          if (el.getAttribute("placeholder") && !el.value) {
            const r = textRow(el, state, "::placeholder");
            if (r) rows.push(r);
          }
        }
        rows.push(...nonTextRows(el, state));
      }
    }
    return rows;
  };
  window.__contrast = {
    collect: (selector, state) =>
      collect(Array.from(document.querySelectorAll(selector)), state),
    single: (el, state) => {
      const rows = [];
      const hasText =
        Array.from(el.childNodes).some(
          (n) => n.nodeType === 3 && /\S/.test(n.nodeValue),
        ) ||
        (el.tagName === "INPUT" && el.value);
      if (hasText) {
        const r = textRow(el, state);
        if (r) rows.push(r);
      }
      for (const d of el.querySelectorAll("*")) {
        if (!visible(d)) continue;
        if (
          Array.from(d.childNodes).some(
            (n) => n.nodeType === 3 && /\S/.test(n.nodeValue),
          )
        ) {
          const r = textRow(d, state);
          if (r) rows.push(r);
        }
      }
      rows.push(...nonTextRows(el, state));
      return rows;
    },
    hoverables: (selector) => {
      const out = [];
      const els = Array.from(document.querySelectorAll(selector + " *")).filter(
        visible,
      );
      for (const el of els) {
        const has = rules().some((r) => {
          if (!r.selectorText.includes(":hover")) return false;
          const sel = r.selectorText.replace(/:hover/g, "");
          try {
            return el.matches(sel);
          } catch {
            return false;
          }
        });
        if (has && !isDisabled(el)) out.push(el);
      }
      return out;
    },
    focusables: (selector) =>
      Array.from(
        document.querySelectorAll(
          selector +
            " button, " +
            selector +
            " a[href], " +
            selector +
            " input, " +
            selector +
            " select, " +
            selector +
            " textarea, " +
            selector +
            " [tabindex]:not([tabindex='-1'])",
        ),
      ).filter((el) => visible(el) && !isDisabled(el)),
    identity,
  };
}

// --------------------------------------------------------------- driver -----
async function loadPlaywright() {
  const req = createRequire(path.join(PW_DIR, "package.json"));
  try {
    return req("playwright-core");
  } catch {
    /* fall through */
  }
  try {
    return req("playwright");
  } catch {
    /* fall through */
  }
  throw new Error(
    `playwright-core not found under ${PW_DIR}. Install it there or pass --pw-dir / PW_MODULE_DIR.`,
  );
}
function finalize(r, component, context) {
  const fgChain = r.fg_token ? staticChain(r.fg_token, context) : null;
  const bgChain =
    r.bg_token && r.bg_token.startsWith("--")
      ? staticChain(r.bg_token, context)
      : null;
  let requirement, threshold;
  if (r.element.startsWith("(page)")) {
    requirement = "consumer-owned";
    threshold = null;
  } else if (r.disabled) {
    requirement = "exempt-disabled";
    threshold = null;
  } else if (r.kind === "text") {
    requirement = "required";
    threshold = r.large ? 3 : 4.5;
  } else if (r.decorative) {
    requirement = "exempt-decorative";
    threshold = null;
  } else if (r.required) {
    requirement = "required";
    threshold = 3;
  } else {
    requirement = "informational";
    threshold = null;
  }
  let verdict;
  if (requirement === "consumer-owned") verdict = "INFO";
  else if (r.ratio == null)
    verdict = r.subkind === "focus-ring" ? "FAIL" : "INFO";
  else if (requirement === "required")
    verdict = r.ratio >= threshold ? "PASS" : "FAIL";
  else if (requirement.startsWith("exempt")) verdict = "EXEMPT";
  else verdict = "INFO";
  const projectBar = r.ratio == null ? null : r.ratio >= 3 ? "PASS" : "FAIL";
  return {
    component,
    context,
    state: r.state,
    kind: r.kind,
    subkind: r.subkind,
    element: r.element,
    path: r.path,
    text: r.text || undefined,
    fg_token: r.fg_token,
    fg_chain: fgChain
      ? fgChain.chain.join(" → ") + (fgChain.value ? " → " + fgChain.value : "")
      : null,
    fg_decl: r.fg_decl || null,
    fg_source: r.fg_source || null,
    fg_rendered: r.fg_rendered,
    bg_token: r.bg_token,
    bg_chain: bgChain
      ? bgChain.chain.join(" → ") + (bgChain.value ? " → " + bgChain.value : "")
      : null,
    bg_rendered: r.bg_rendered,
    ratio: r.ratio,
    font_px: r.font_px,
    font_weight: r.font_weight,
    large: r.large,
    requirement,
    threshold,
    verdict,
    project_bar_3: projectBar,
    focus_visible: r.focus_visible,
    count: 1,
  };
}
function dedupe(rows) {
  const map = new Map();
  for (const r of rows) {
    const k = [
      r.component,
      r.context,
      r.state,
      r.kind,
      r.subkind,
      r.element,
      r.fg_rendered,
      r.bg_rendered,
      r.ratio,
    ].join("|");
    if (map.has(k)) map.get(k).count++;
    else map.set(k, r);
  }
  return Array.from(map.values());
}

async function main() {
  if (!fs.existsSync(path.join(DIST, "index.html")))
    throw new Error(
      `No docs build at ${DIST}. Run: npx ng build docs --configuration=development`,
    );
  const pw = await loadPlaywright();
  const { server, base } = await serve(DIST);
  const launch = CHROME ? { executablePath: CHROME } : { channel: "chrome" };
  const browser = await pw.chromium
    .launch({ headless: true, ...launch })
    .catch(async (e) => {
      const fallback = path.join(
        process.env.HOME || "",
        ".cache/ms-playwright/chromium-1208/chrome-linux64/chrome",
      );
      if (fs.existsSync(fallback))
        return pw.chromium.launch({ headless: true, executablePath: fallback });
      throw e;
    });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  page.on("pageerror", (e) => console.error("  pageerror:", e.message));
  const components = ONLY.length
    ? COMPONENTS.filter((c) => ONLY.includes(c))
    : COMPONENTS;
  const rows = [];
  const meta = {
    generated_by: "tools/contrast/measure.mjs",
    dist: path.relative(ROOT, DIST),
    contexts: CONTEXTS,
    components: components.length,
    hover: DO_HOVER,
    focus: DO_FOCUS,
    notes: [],
  };
  const PREVIEW = ".docs-demo__preview";
  const OVL = ".cdk-overlay-container";

  for (const component of components) {
    const url =
      component === "skeleton"
        ? `${base}/__fixture/skeleton`
        : `${base}/components/${component}`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector(PREVIEW, { timeout: 15000 });
    await page.addStyleTag({
      content: `*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important} ${PREVIEW}{background:var(--ui-color-surface)!important}`,
    });
    const config = {
      requiredSelectors: REQUIRED_NON_TEXT[component] || [],
      decorative: DECORATIVE[component] || false,
      glyphSelectors: NON_TEXT_GLYPHS,
    };
    await page.evaluate(installInPage, config);
    const previews = await page.locator(PREVIEW).count();
    process.stdout.write(`${component} (${previews} demos)`);
    for (const context of CONTEXTS) {
      await page.evaluate((cls) => {
        document.documentElement.className = cls;
      }, CONTEXT_CLASS[context] ?? context);
      await page.waitForTimeout(60);
      const collected = await page.evaluate(
        (sel) => window.__contrast.collect(sel, "default"),
        PREVIEW,
      );
      let n = collected.length;
      rows.push(...collected.map((r) => finalize(r, component, context)));
      // Overlay content (dialog, menu, popover, select listbox, tooltip).
      const ov = OVERLAY[component];
      if (ov) {
        try {
          if (ov.click) await page.locator(ov.click).first().click();
          if (ov.hover) await page.locator(ov.hover).first().hover();
          await page.waitForSelector(ov.wait, { timeout: 3000 });
          await page.waitForTimeout(80);
          const inOverlay = await page.evaluate(
            (sel) => window.__contrast.collect(sel, "open"),
            OVL,
          );
          n += inOverlay.length;
          rows.push(...inOverlay.map((r) => finalize(r, component, context)));
          if (ov.close === "Escape") await page.keyboard.press("Escape");
          else await page.mouse.move(5, 5);
          await page.waitForTimeout(120);
        } catch (e) {
          meta.notes.push(
            `${component}/${context}: overlay not measured (${e.message.split("\n")[0]})`,
          );
          await page.keyboard.press("Escape").catch(() => {});
        }
      }
      // Focus rings.
      if (DO_FOCUS) {
        const handles = await page.evaluateHandle(
          (sel) => window.__contrast.focusables(sel),
          PREVIEW,
        );
        const count = await handles.evaluate((a) => a.length);
        const seenIds = new Set();
        for (let i = 0; i < count; i++) {
          const el = await handles.evaluateHandle((a, i) => a[i], i);
          const id = await el.evaluate((e) => window.__contrast.identity(e));
          if (seenIds.has(id)) continue;
          seenIds.add(id);
          await el.evaluate((e) => e.focus({ focusVisible: true }));
          await page.waitForTimeout(30);
          const r = await el.evaluate((e) =>
            window.__contrast.single(e, "focus"),
          );
          n += r.length;
          rows.push(
            ...r
              .filter((x) => x.subkind.startsWith("focus-ring"))
              .map((x) => finalize(x, component, context)),
          );
          await el.evaluate((e) => e.blur());
        }
        await handles.dispose();
      }
      // Hover states.
      if (DO_HOVER) {
        const handles = await page.evaluateHandle(
          (sel) => window.__contrast.hoverables(sel),
          PREVIEW,
        );
        const count = await handles.evaluate((a) => a.length);
        const seenIds = new Set();
        for (let i = 0; i < count && i < 40; i++) {
          const el = await handles.evaluateHandle((a, i) => a[i], i);
          const id = await el.evaluate((e) => window.__contrast.identity(e));
          if (seenIds.has(id)) continue;
          seenIds.add(id);
          try {
            await el.hover({ timeout: 1500 });
          } catch {
            continue;
          }
          await page.waitForTimeout(30);
          const r = await el.evaluate((e) =>
            window.__contrast.single(e, "hover"),
          );
          n += r.length;
          rows.push(...r.map((x) => finalize(x, component, context)));
        }
        await page.mouse.move(5, 5);
        await handles.dispose();
      }
      process.stdout.write(`  ${context}:${n}`);
    }
    process.stdout.write("\n");
  }
  await browser.close();
  server.close();

  const out = dedupe(rows);
  fs.mkdirSync(OUT, { recursive: true });
  const gitSha = (() => {
    try {
      return fs.readFileSync(path.join(ROOT, ".git/HEAD"), "utf8").trim();
    } catch {
      return null;
    }
  })();
  meta.tree = opt("label", gitSha);
  // One row per line: diffable in git, still valid JSON.
  fs.writeFileSync(
    path.join(OUT, "matrix.json"),
    '{"meta":' +
      JSON.stringify(meta) +
      ',\n"rows":[\n' +
      out.map((r) => JSON.stringify(r)).join(",\n") +
      "\n]}\n",
  );
  const cols = [
    "component",
    "context",
    "state",
    "kind",
    "subkind",
    "requirement",
    "threshold",
    "ratio",
    "verdict",
    "project_bar_3",
    "element",
    "fg_token",
    "fg_rendered",
    "bg_token",
    "bg_rendered",
    "font_px",
    "font_weight",
    "large",
    "count",
    "fg_chain",
    "bg_chain",
    "path",
    "text",
  ];
  const csv = [cols.join(",")]
    .concat(
      out.map((r) =>
        cols
          .map((c) => {
            const v = r[c];
            return v == null
              ? ""
              : /[",\n]/.test(String(v))
                ? '"' + String(v).replace(/"/g, '""') + '"'
                : String(v);
          })
          .join(","),
      ),
    )
    .join("\n");
  fs.writeFileSync(path.join(OUT, "matrix.csv"), csv + "\n");
  const fails = out.filter((r) => r.verdict === "FAIL");
  console.log(
    `\nrows: ${out.length}  FAIL: ${fails.length}  PASS: ${out.filter((r) => r.verdict === "PASS").length}  INFO: ${out.filter((r) => r.verdict === "INFO").length}  EXEMPT: ${out.filter((r) => r.verdict === "EXEMPT").length}`,
  );
  for (const nte of meta.notes) console.log("note:", nte);
  console.log(`wrote ${path.relative(ROOT, OUT)}/matrix.json + matrix.csv`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
