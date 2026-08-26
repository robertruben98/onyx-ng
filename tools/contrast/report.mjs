#!/usr/bin/env node
/**
 * Render tools/contrast/matrix.json as Markdown (failure clusters, coverage
 * per component x context, full FAIL list, the disabled/A-08 table) and,
 * with --compare <other matrix.json>, the rows whose verdict changed.
 *
 *   node tools/contrast/report.mjs [--in tools/contrast/matrix.json] [--out -]
 *                                  [--compare other.json] [--compare-label "wave2/tokens@sha"]
 */
import fs from "node:fs";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const IN = opt("in", "tools/contrast/matrix.json");
const OUT = opt("out", "-");
const CMP = opt("compare", null);
const CMP_LABEL = opt("compare-label", CMP);

const data = JSON.parse(fs.readFileSync(IN, "utf8"));
const rows = data.rows;
const meta = data.meta || {};
const ctxs = meta.contexts || ["light", "dark", "acme"];
const by = (arr, f) => { const m = new Map(); for (const r of arr) { const k = f(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); } return m; };
const n = (arr) => arr.length;
const md = (s) => String(s ?? "").replace(/\|/g, "\\|");
const code = (s) => (s == null || s === "" ? "—" : "`" + String(s).replace(/`/g, "") + "`");
const chainOf = (r, side) => { const c = r[side + "_chain"]; return c ? c.replace(/ → /g, " → ") : r[side + "_token"] || "—"; };
const lines = [];
const P = (...s) => lines.push(...s);

const comps = Array.from(new Set(rows.map((r) => r.component))).sort();
const fails = rows.filter((r) => r.verdict === "FAIL");
const count = (v) => rows.filter((r) => r.verdict === v).length;

P(`# Onyx UI — measured contrast matrix`, ``);
P(`Tree: \`${meta.tree || "?"}\` · dist: \`${meta.dist || "?"}\` · contexts: ${ctxs.map((c) => "`" + c + "`").join(", ")} · components: **${comps.length}** · rows: **${rows.length}** (after merging identical elements; \`count\` keeps the multiplicity).`, ``);
P(`| verdict | rows | meaning |`, `|---|---:|---|`);
P(`| **FAIL** | ${count("FAIL")} | a *required* pair below its threshold (text 4.5:1 / large text 3:1 / non-text UI boundary or state 3:1) |`);
P(`| PASS | ${count("PASS")} | a required pair at or above threshold |`);
P(`| INFO | ${count("INFO")} | measured, not asserted: informational non-text (card/alert/badge boxes, hover boxes, icons, ring-vs-control) or consumer-owned elements in a demo |`);
P(`| EXEMPT | ${count("EXEMPT")} | disabled/inactive (WCAG 1.4.3 & 1.4.11 exemption) or decorative (skeleton, divider line). Ratio still recorded; \`project_bar_3\` says whether it clears 3:1 |`, ``);

// --- failure clusters ---------------------------------------------------
P(`## 1. Failure clusters — what the gate has to assert against`, ``);
P(`One line per (foreground token, background token, target kind). The **token chain** is the static var() resolution in that context; the rendered hex is what Chromium painted.`, ``);
P(`| # | fg token → chain | on bg token | kind | contexts | ratio | thr | components (elements) |`, `|---:|---|---|---|---|---|---|---|`);
const clusters = by(fails, (r) => [r.fg_token, r.bg_token, r.kind === "text" ? "text" : r.subkind].join("|"));
let i = 0;
const clusterRows = Array.from(clusters.entries()).sort((a, b) => Math.min(...a[1].map((r) => r.ratio ?? 0)) - Math.min(...b[1].map((r) => r.ratio ?? 0)));
for (const [, rs] of clusterRows) {
  i++;
  const r0 = rs[0];
  const ctxSet = Array.from(new Set(rs.map((r) => r.context))).sort();
  const ratios = ctxs.filter((c) => ctxSet.includes(c)).map((c) => { const rr = rs.filter((r) => r.context === c).map((r) => r.ratio).filter((x) => x != null); return rr.length ? `${c} ${Math.min(...rr)}` : `${c} n/a`; }).join(" · ");
  const compsTxt = Array.from(by(rs, (r) => r.component).entries()).map(([c, xs]) => `${c} (${Array.from(new Set(xs.map((x) => x.element.split(" › ").pop().split(" [")[0]))).slice(0, 3).join(", ")})`).join("; ");
  P(`| ${i} | ${code(chainOf(r0, "fg"))} | ${code(r0.bg_token)} | ${r0.kind === "text" ? (r0.subkind === "placeholder" ? "text (placeholder)" : "text") : "non-text: " + r0.subkind} | ${ctxSet.join(", ")} | ${ratios} | ${r0.threshold} | ${md(compsTxt)} |`);
}
P(``);
// tokens implicated
const semantic = by(fails, (r) => (r.fg_chain || r.fg_token || "").split(" → ").filter((t) => t.startsWith("--ui-color-") || t.startsWith("--ui-slate-") || t.startsWith("--ui-focus"))[0] || r.fg_token);
P(`**Root tokens implicated** (first semantic/primitive step in each failing chain): ` + Array.from(semantic.entries()).sort((a, b) => b[1].length - a[1].length).map(([t, xs]) => `${code(t)} ×${xs.length} rows`).join(", ") + ".", ``);

// --- coverage per component x context (text) ----------------------------
P(`## 2. Coverage — every text pair, every component, every context`, ``);
P(`Text pairs measured per component and context: \`pairs (fails) · min ratio\`. Placeholder text counts as text. Disabled text is listed under *exempt*. Components with no text (progress-bar, skeleton, spinner) show their non-text rows instead.`, ``);
P(`| component | ${ctxs.map((c) => `${c}: text pairs (FAIL) · min`).join(" | ")} | non-text required pairs (FAIL) | exempt rows |`, `|---|${ctxs.map(() => "---").join("|")}|---|---|`);
for (const c of comps) {
  const rs = rows.filter((r) => r.component === c);
  const cells = ctxs.map((ctx) => {
    const t = rs.filter((r) => r.context === ctx && r.kind === "text" && r.requirement === "required");
    if (!t.length) { const nt = rs.filter((r) => r.context === ctx && r.kind === "non-text"); return `— (${nt.length} non-text)`; }
    const f = t.filter((r) => r.verdict === "FAIL").length;
    return `${t.length} (${f ? "**" + f + "**" : 0}) · ${Math.min(...t.map((r) => r.ratio))}`;
  });
  const ntReq = rs.filter((r) => r.kind === "non-text" && r.requirement === "required");
  const ntF = ntReq.filter((r) => r.verdict === "FAIL").length;
  P(`| ${c} | ${cells.join(" | ")} | ${ntReq.length} (${ntF ? "**" + ntF + "**" : 0}) | ${rs.filter((r) => r.verdict === "EXEMPT").length} |`);
}
P(``);

// --- A-08 tension: disabled rows -----------------------------------------
P(`## 3. Disabled / inactive pairs — reported, never asserted (the A-08 tension)`, ``);
P(`WCAG exempts inactive controls from 1.4.3 and 1.4.11, so these rows are \`EXEMPT\` and a gate must **not** fail on them. Kevin's A-08 verdict (slate-500 on slate-800 = 3.07:1 in dark is a design choice meeting the project's own ≥3:1 bar) lives here: \`project_bar_3\` is that bar, kept as a separate column so the project can tighten it without confusing it with WCAG.`, ``);
const dis = rows.filter((r) => r.requirement === "exempt-disabled" && r.kind === "text");
const disPairs = by(dis, (r) => [r.fg_token, r.bg_token].join("|"));
P(`| fg token → chain | on bg token | ${ctxs.map((c) => c).join(" | ")} | components |`, `|---|---|${ctxs.map(() => "---").join("|")}|---|`);
for (const [, rs] of Array.from(disPairs.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
  const r0 = rs[0];
  const cells = ctxs.map((c) => { const x = rs.filter((r) => r.context === c); if (!x.length) return "—"; const m = Math.min(...x.map((r) => r.ratio)); return `${m} ${m >= 3 ? "≥3" : "**<3**"}`; });
  P(`| ${code(chainOf(r0, "fg"))} | ${code(r0.bg_token)} | ${cells.join(" | ")} | ${Array.from(new Set(rs.map((r) => r.component))).join(", ")} |`);
}
P(``);

// --- informational notables ---------------------------------------------
P(`## 4. Informational rows worth a human look (INFO, not asserted)`, ``);
const info = rows.filter((r) => r.verdict === "INFO" && r.requirement === "informational" && r.ratio != null && r.ratio < 3 && !["box", "border-vs-own-bg", "border-t-vs-own-bg"].includes(r.subkind) && r.state !== "hover");
const infoPairs = by(info, (r) => [r.component, r.subkind, r.fg_token, r.bg_token].join("|"));
P(`Non-text pairs under 3:1 that the rules above classify as informational (boxes that are identified by their text, icons, rings against their own control, spinner tracks). Listed so the classification itself can be challenged.`, ``);
P(`| component | subkind | element | fg token | bg token | ${ctxs.join(" | ")} |`, `|---|---|---|---|---|${ctxs.map(() => "---").join("|")}|`);
for (const [, rs] of Array.from(infoPairs.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
  const r0 = rs[0];
  P(`| ${r0.component} | ${r0.subkind} | ${md(r0.element.slice(0, 70))} | ${code(r0.fg_token)} | ${code(r0.bg_token)} | ${ctxs.map((c) => { const x = rs.filter((r) => r.context === c); return x.length ? Math.min(...x.map((r) => r.ratio)) : "—"; }).join(" | ")} |`);
}
P(``);

// --- full FAIL list ------------------------------------------------------
P(`## 5. Every FAIL row`, ``);
P(`| component | context | state | kind/subkind | element | fg token | fg | bg token | bg | ratio | thr |`, `|---|---|---|---|---|---|---|---|---|---:|---:|`);
for (const r of fails.sort((a, b) => a.component.localeCompare(b.component) || ctxs.indexOf(a.context) - ctxs.indexOf(b.context) || (a.ratio ?? 0) - (b.ratio ?? 0))) {
  P(`| ${r.component} | ${r.context} | ${r.state} | ${r.kind === "text" ? r.subkind : "non-text/" + r.subkind} | ${md(r.element.slice(0, 80))} | ${code(r.fg_token)} | ${code(r.fg_rendered)} | ${code(r.bg_token)} | ${code(r.bg_rendered)} | ${r.ratio ?? "—"} | ${r.threshold} |`);
}
P(``);

// --- attribution / limits ------------------------------------------------
const lib = rows.filter((r) => r.requirement !== "consumer-owned");
const unattributed = lib.filter((r) => !r.fg_token);
P(`## 6. Measurement coverage and limits`, ``);
P(`- Token attribution: ${lib.length - unattributed.length}/${lib.length} library-owned rows name the foreground token (${unattributed.length} unattributed: ${Array.from(new Set(unattributed.map((r) => r.component + " " + r.subkind))).join(", ") || "none"}).`);
P(`- States measured: default, hover (elements with a \`:hover\` rule), focus (programmatic focus, ring read from the element or its \`:focus-within\` wrapper), open (overlay content of dialog, menu, popover, select, tooltip). Not measured: active/pressed, dark+acme composition (\`--contexts light,dark,acme,dark+acme\` adds it).`);
P(`- Range inputs: track/thumb live in \`::-webkit-slider-*\` pseudo-elements that \`getComputedStyle\` cannot expose; their rows are **token-resolved** at the element (\`fg_source\` says so), not read from paint.`);
P(`- Native checkbox/radio: the UA paints the box; \`accent-color\` (checked fill) is measured, the unchecked UA border is not themeable and not measured.`);
P(`- Skeleton has no docs page; it is rendered from a fixture built from its own SCSS (\`/__fixture/skeleton\`).`);
P(`- Consumer-owned elements (plain \`<button>\`s carrying the tooltip/popover directives in demos) are measured and reported INFO: their colours are the host app's.`, ``);

// --- compare -------------------------------------------------------------
if (CMP) {
  const other = JSON.parse(fs.readFileSync(CMP, "utf8"));
  const key = (r) => [r.component, r.context, r.state, r.kind, r.subkind, r.element].join("|");
  const A = new Map(rows.map((r) => [key(r), r]));
  const B = new Map(other.rows.map((r) => [key(r), r]));
  const changed = [], gone = [], added = [];
  for (const [k, a] of A) { const b = B.get(k); if (!b) gone.push(a); else if (a.verdict !== b.verdict || a.ratio !== b.ratio || a.fg_rendered !== b.fg_rendered || a.bg_rendered !== b.bg_rendered) changed.push([a, b]); }
  for (const [k, b] of B) if (!A.has(k)) added.push(b);
  const bf = other.rows.filter((r) => r.verdict === "FAIL");
  P(`## 7. Delta vs \`${CMP_LABEL}\``, ``);
  P(`Other tree: \`${other.meta?.tree || "?"}\` — ${other.rows.length} rows, **${bf.length} FAIL** (baseline ${fails.length}). Rows keyed by (component, context, state, kind, subkind, element).`, ``);
  P(`| baseline verdict → other | rows |`, `|---|---:|`);
  const trans = by(changed, ([a, b]) => `${a.verdict} → ${b.verdict}`);
  for (const [k, xs] of Array.from(trans.entries()).sort()) P(`| ${k} | ${xs.length} |`);
  P(`| rows only in baseline | ${gone.length} |`, `| rows only in other | ${added.length} |`, ``);
  P(`### Changed rows (verdict or rendered colour)`, ``);
  P(`| component | context | element | fg token | baseline | other | verdict |`, `|---|---|---|---|---|---|---|`);
  for (const [a, b] of changed.sort((x, y) => x[0].component.localeCompare(y[0].component) || x[0].context.localeCompare(y[0].context))) {
    P(`| ${a.component} | ${a.context} | ${md(a.element.slice(0, 70))} | ${code(b.fg_token || a.fg_token)} | ${a.fg_rendered}/${a.bg_rendered} ${a.ratio} | ${b.fg_rendered}/${b.bg_rendered} ${b.ratio} | ${a.verdict === b.verdict ? a.verdict : `**${a.verdict} → ${b.verdict}**`} |`);
  }
  P(``);
  if (bf.length) {
    P(`### FAIL rows remaining in \`${CMP_LABEL}\``, ``);
    P(`| component | context | kind/subkind | element | fg token → chain | bg token | ratio | thr |`, `|---|---|---|---|---|---|---:|---:|`);
    for (const r of bf.sort((x, y) => x.component.localeCompare(y.component) || x.context.localeCompare(y.context))) P(`| ${r.component} | ${r.context} | ${r.kind === "text" ? r.subkind : "non-text/" + r.subkind} | ${md(r.element.slice(0, 70))} | ${code(chainOf(r, "fg"))} | ${code(r.bg_token)} | ${r.ratio ?? "—"} | ${r.threshold} |`);
    P(``);
  }
}

const text = lines.join("\n") + "\n";
if (OUT === "-") process.stdout.write(text); else { fs.writeFileSync(OUT, text); console.error(`wrote ${OUT}`); }
