#!/usr/bin/env node
/**
 * Render tools/layout/findings.json as Markdown: what was checked, one table
 * per defect class with instances grouped across viewport widths, and the
 * INFO rows kept in an appendix so the classification can be argued.
 *
 *   node tools/layout/report.mjs [--in tools/layout/findings.json] [--out -] [--shots-prefix <url or path>]
 */
import fs from "node:fs";

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
const IN = opt("in", "tools/layout/findings.json");
const OUT = opt("out", "-");
const SHOTS = opt("shots-prefix", "");
const data = JSON.parse(fs.readFileSync(IN, "utf8"));
const { meta, findings } = data;
const md = (s) => String(s ?? "").replace(/\|/g, "\\|");
const code = (s) => (s == null || s === "" ? "—" : "`" + String(s) + "`");
const box = (b) => (b ? `${b.w}×${b.h} @ ${b.x},${b.y}` : "—");
const L = [];
const P = (...s) => L.push(...s);
const by = (arr, f) => {
  const m = new Map();
  for (const r of arr) {
    const k = f(r);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
  return m;
};
const shot = (r) =>
  r.shot ? (SHOTS ? `[${r.shot}](${SHOTS}${r.shot})` : `\`${r.shot}\``) : "—";
const widths = (rs) =>
  Array.from(new Set(rs.map((r) => r.width)))
    .sort((a, b) => b - a)
    .join("/");

const KINDS = {
  "collapsed-occupies": [
    "Collapsed panels that still occupy space",
    "An intended-collapsed panel (aria-expanded=false → aria-controls, [hidden], [aria-hidden], zero-height wrapper) whose box is not 0px, and how many px of its text show through the clip.",
  ],
  "text-cut": [
    "Text cut by an overflow ancestor",
    "A text rect that extends past the padding box of the nearest overflow:hidden/clip ancestor (scrollable ancestors are INFO).",
  ],
  "content-clipped": [
    "Content clipped horizontally",
    "scrollWidth > clientWidth on an overflow-x:hidden element that does not truncate with an ellipsis.",
  ],
  "text-truncated": [
    "Text truncated with an ellipsis",
    "nowrap + overflow hidden + text-overflow: ellipsis actually engaged at this width; P2 when no title/aria-label carries the full text.",
  ],
  spill: [
    "Boxes spilling their demo container",
    "A non-positioned box whose rect extends past the demo preview's rect.",
  ],
  "exceeds-viewport": [
    "Boxes wider than the viewport",
    "Rect right edge past window.innerWidth.",
  ],
  "page-hscroll": [
    "Horizontal page scroll",
    "document scrollWidth > clientWidth, with the widest offenders and whether they sit inside a component demo or in the docs chrome.",
  ],
  "focus-ring-cut": [
    "Focus rings cut by overflow",
    "Ring = outline (width+offset) or box-shadow reach on the focused element or its :focus-within wrapper, intersected with the padding box of the nearest overflow ancestor.",
  ],
  "no-focus-ring": [
    "Focusable elements with no visible ring",
    "Programmatic focus produced neither outline nor box-shadow on the element or its wrapper.",
  ],
  overlap: [
    "Overlapping boxes",
    "Two visible boxes (text or paint) intersecting by more than 2×2 px while neither contains the other. Pairs involving a positioned element are INFO (overlays are meant to overlap).",
  ],
  "zero-size-focusable": [
    "Focusable elements with no box",
    "Focusable but width or height < 1px; the sr-only pattern (absolute + clipped) is INFO.",
  ],
  "scrollable-x": [
    "Horizontally scrollable containers",
    "overflow-x auto/scroll with content wider than the box — the intended way to survive a narrow width; listed for completeness.",
  ],
};

P(`# Onyx UI — geometry sweep`, ``);
P(
  `Tree: \`${meta.tree || "?"}\` · dist: \`${meta.dist}\` · viewports: ${meta.widths.map((w) => "`" + w + "`").join(", ")} · components: **${meta.components}**.`,
  ``,
);
P(
  `**Checked:** ${meta.checked.elements} elements, ${meta.checked.text_nodes} text nodes, ${meta.checked.focusables} focusable elements (focused one by one), ${meta.checked.collapsed_panels} intended-collapsed panels, overlays opened for dialog/menu/popover/select/tooltip, at every width. Demo preview width per viewport: ${Object.entries(
    meta.preview_widths,
  )
    .filter(([k]) => k.startsWith("button@"))
    .map(([k, v]) => `${k.split("@")[1]}px → ${v}px`)
    .join(", ")}.`,
  ``,
);
const sev = (s) => findings.filter((r) => r.severity === s).length;
P(
  `| severity | rows |`,
  `|---|---:|`,
  `| P1 | ${sev("P1")} |`,
  `| P2 | ${sev("P2")} |`,
  `| INFO | ${sev("INFO")} |`,
  ``,
);
P(
  `Rows are per (component, width, state, element); the tables below merge identical elements across widths and show the widths where the instance occurs.`,
  ``,
);

const order = Object.keys(KINDS);
for (const kind of order) {
  const rs = findings.filter((r) => r.kind === kind);
  if (!rs.length) {
    P(`## ${KINDS[kind][0]} — none found`, ``);
    continue;
  }
  P(`## ${KINDS[kind][0]} (${rs.length} rows)`, ``, KINDS[kind][1], ``);
  const groups = by(rs, (r) =>
    [
      r.component,
      r.state,
      r.element,
      r.element_b || "",
      r.sample_text || r.text || "",
    ].join("|"),
  );
  const cols =
    {
      "collapsed-occupies": [
        "occupies px",
        "visible text px",
        "sample",
        "grid rows",
        "inner padding",
      ],
      "text-cut": ["text", "clipped by", "cut px"],
      "content-clipped": ["hidden px", "text"],
      "text-truncated": ["hidden px", "has title", "text"],
      spill: ["spill px", "container", "white-space"],
      "exceeds-viewport": ["by px", "viewport"],
      "page-hscroll": ["scroll/client", "offenders"],
      "focus-ring-cut": ["ring on", "via", "spread", "clipped by", "cut px"],
      "no-focus-ring": ["focus-visible"],
      overlap: ["with", "overlap px", "positioned"],
      "zero-size-focusable": ["sr-only pattern", "opacity"],
      "scrollable-x": ["hidden px"],
    }[kind] || [];
  P(
    `| sev | component | state | element | widths | box | ${cols.join(" | ")} | shot |`,
    `|---|---|---|---|---|---|${cols.map(() => "---").join("|")}|---|`,
  );
  for (const [, xs] of Array.from(groups.entries()).sort(
    (a, b) =>
      a[1][0].severity.localeCompare(b[1][0].severity) ||
      a[1][0].component.localeCompare(b[1][0].component),
  )) {
    const r = xs[0];
    const vals =
      {
        "collapsed-occupies": [
          r.occupies_px,
          r.visible_text_px,
          md(r.sample_text),
          code(r.grid_template_rows),
          code(r.inner_padding),
        ],
        "text-cut": [md(r.text), code(r.clipped_by), JSON.stringify(r.cut_px)],
        "content-clipped": [r.hidden_px, md(r.text)],
        "text-truncated": [r.hidden_px, r.has_title ? "yes" : "no", md(r.text)],
        spill: [
          JSON.stringify(r.spill_px),
          code(r.container),
          code(r.white_space),
        ],
        "exceeds-viewport": [r.by_px, r.viewport],
        "page-hscroll": [
          `${r.scroll_width}/${r.client_width}`,
          md((r.offenders || []).join("; ")),
        ],
        "focus-ring-cut": [
          code(r.ring_on),
          r.via,
          r.spread_px,
          code(r.clipped_by),
          JSON.stringify(r.cut_px),
        ],
        "no-focus-ring": [String(r.focus_visible)],
        overlap: [
          md(r.element_b),
          JSON.stringify(r.overlap_px),
          r.positioned ? "yes" : "no",
        ],
        "zero-size-focusable": [r.sr_only_pattern ? "yes" : "no", r.opacity],
        "scrollable-x": [r.hidden_px],
      }[kind] || [];
    P(
      `| ${r.severity} | ${r.component} | ${r.state} | ${md(r.element)} | ${widths(xs)} | ${box(r.box)} | ${vals.join(" | ")} | ${shot(xs.find((x) => x.shot) || r)} |`,
    );
  }
  P(``);
}
if (meta.notes?.length) {
  P(`## Harness notes`, ``);
  for (const n of meta.notes) P(`- ${n}`);
  P(``);
}
const text = L.join("\n") + "\n";
if (OUT === "-") process.stdout.write(text);
else {
  fs.writeFileSync(OUT, text);
  console.error(`wrote ${OUT}`);
}
