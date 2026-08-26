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
  // Row identity across trees: the element plus the tokens it paints with. Several
  // elements share an identity string (three muted spans in a table footer, two
  // tokens in one box-shadow), so the token pair is part of the key.
  const key = (r) => [r.component, r.context, r.state, r.kind, r.subkind, r.element, r.fg_token || r.fg_decl || "", r.bg_token || ""].join("|");
  const k2 = (r) => [r.component, r.state, r.kind, r.subkind, r.element, r.fg_token || r.fg_decl || "", r.bg_token || ""].join("|");
  const A = new Map(rows.map((r) => [key(r), r]));
  const B = new Map(other.rows.map((r) => [key(r), r]));
  const ctxsB = other.meta?.contexts || ctxs;
  const allCtx = Array.from(new Set([...ctxs, ...ctxsB]));
  const bf = other.rows.filter((r) => r.verdict === "FAIL");
  P(`## 7. Delta vs \`${CMP_LABEL}\``, ``);
  P(`Other tree: \`${other.meta?.tree || "?"}\` — ${other.rows.length} rows, **${bf.length} FAIL** (baseline ${fails.length}). Rows keyed by (component, context, state, kind, subkind, element, fg token, bg token); rows only in one tree: ${rows.filter((r) => !B.has(key(r))).length} baseline-only, ${other.rows.filter((r) => !A.has(key(r))).length} other-only.`, ``);
  P(`| context | baseline FAIL | other FAIL |`, `|---|---:|---:|`);
  for (const c of allCtx) P(`| ${c} | ${rows.filter((r) => r.context === c && r.verdict === "FAIL").length} | ${other.rows.filter((r) => r.context === c && r.verdict === "FAIL").length} |`);
  P(``);

  // Composition check: a composed context (a+b) whose rows are ~identical to one of its parts did not compose.
  const regressed = new Set();
  const composed = allCtx.filter((c) => c.includes("+"));
  if (composed.length) {
    P(`### Composition check`, ``);
    P(`For a composed context (\`a+b\`), how many of its rows render pixel-identical to each part alone. A context that is ≈100 % identical to one part has not composed; every verdict change inside it is then a **composition artefact, not a token change**, and is flagged \`⚠ regression\` below.`, ``);
    P(`| tree | context | rows | identical to \`${composed[0].split("+")[0]}\` | identical to \`${composed[0].split("+")[1]}\` |`, `|---|---|---:|---:|---:|`);
    for (const c of composed) {
      const [pa, pb] = c.split("+");
      for (const [name, set] of [["baseline", rows], ["other", other.rows]]) {
        const da = set.filter((r) => r.context === c);
        const ma = new Map(set.filter((r) => r.context === pa).map((r) => [k2(r), r]));
        const mb = new Map(set.filter((r) => r.context === pb).map((r) => [k2(r), r]));
        const same = (x, y) => y && x.fg_rendered === y.fg_rendered && x.bg_rendered === y.bg_rendered;
        const sa = da.filter((r) => same(r, ma.get(k2(r)))).length, sb = da.filter((r) => same(r, mb.get(k2(r)))).length;
        const broken = da.length && (sa / da.length > 0.9 || sb / da.length > 0.9);
        if (broken && name === "other") regressed.add(c);
        P(`| ${name} | ${c} | ${da.length} | ${sa} | ${sb} |${broken ? " **← did not compose**" : ""}`);
      }
    }
    P(``);
  }
  const flag = (r) => (regressed.has(r.context) ? " ⚠ regression" : "");

  // (a) every previously-failing row: what happened to it
  P(`### (a) Every baseline FAIL, grouped by (context, fg token, bg token, kind) — verdict in the other tree`, ``);
  const prev = rows.filter((r) => r.verdict === "FAIL");
  const groups = by(prev, (r) => [r.context, r.fg_token, r.bg_token, r.subkind].join("|"));
  const statusOf = (a) => { const b = B.get(key(a)); return b ? b.verdict : "GONE"; };
  const summary = by(prev, (a) => `${statusOf(a)}${regressed.has(a.context) ? " (regression context)" : ""}`);
  P(`| outcome | rows |`, `|---|---:|`);
  for (const [k, xs] of Array.from(summary.entries()).sort()) P(`| ${k === "PASS" ? "fixed (FAIL → PASS)" : k === "FAIL" ? "still failing" : k} | ${xs.length} |`);
  P(``);
  P(`| context | kind | fg token → chain (other) | bg token | rows | baseline | other | outcome |`, `|---|---|---|---|---:|---:|---:|---|`);
  for (const [, xs] of Array.from(groups.entries()).sort((x, y) => x[0].localeCompare(y[0]))) {
    const a = xs[0], b = B.get(key(a));
    const outcome = !b ? "GONE" : b.verdict === "PASS" ? "**fixed**" : b.verdict === "FAIL" ? "still failing" : b.verdict;
    P(`| ${a.context} | ${a.kind === "text" ? a.subkind : "non-text/" + a.subkind} | ${code(b ? chainOf(b, "fg") : chainOf(a, "fg"))} | ${code(a.bg_token)} | ${xs.length} | ${a.ratio} | ${b ? b.ratio : "—"} | ${outcome}${flag(a)} |`);
  }
  P(``);

  // (b) new failures
  const newFails = other.rows.filter((b) => b.verdict === "FAIL" && (!A.has(key(b)) || A.get(key(b)).verdict !== "FAIL"));
  P(`### (b) New failures in the other tree (row was not FAIL in the baseline)`, ``);
  if (!newFails.length) P(`**None.**`, ``);
  else {
    const realNew = newFails.filter((b) => !regressed.has(b.context));
    P(`${newFails.length} rows — **${realNew.length} outside regression contexts**${realNew.length ? "" : " (every new failure sits in a context that did not compose)"}.`, ``);
    P(`| context | component | kind | element | fg token → chain | bg token | baseline | other | note |`, `|---|---|---|---|---|---|---:|---:|---|`);
    for (const b of newFails.sort((x, y) => x.context.localeCompare(y.context) || x.component.localeCompare(y.component))) {
      const a = A.get(key(b));
      P(`| ${b.context} | ${b.component} | ${b.kind === "text" ? b.subkind : "non-text/" + b.subkind} | ${md(b.element.slice(0, 60))} | ${code(chainOf(b, "fg"))} | ${code(b.bg_token)} | ${a ? `${a.verdict} ${a.ratio}` : "new row"} | ${b.ratio} | ${regressed.has(b.context) ? "⚠ regression artefact" : "**new token failure**"} |`);
    }
    P(``);
  }
  // required rows whose margin shrank
  const drops = rows.filter((a) => { const b = B.get(key(a)); return b && a.requirement === "required" && a.ratio != null && b.ratio != null && b.ratio < a.ratio - 0.05 && !regressed.has(a.context); });
  P(`### Required rows whose ratio dropped (outside regression contexts)`, ``);
  if (!drops.length) P(`**None** — no required pair lost margin in ${ctxs.filter((c) => !regressed.has(c)).map((c) => "`" + c + "`").join(", ")}.`, ``);
  else { P(`| context | component | element | baseline | other |`, `|---|---|---|---:|---:|`); for (const a of drops) P(`| ${a.context} | ${a.component} | ${md(a.element.slice(0, 60))} | ${a.ratio} | ${B.get(key(a)).ratio} |`); P(``); }

  // rendered colour changes outside FAIL rows, per context (what else moved)
  const moved = by(rows.filter((a) => { const b = B.get(key(a)); return b && (a.fg_rendered !== b.fg_rendered || a.bg_rendered !== b.bg_rendered); }), (a) => a.context);
  P(`### What else moved (rows whose rendered colours changed, per context)`, ``);
  P(`| context | rows changed | distinct fg tokens involved |`, `|---|---:|---|`);
  for (const c of allCtx) { const xs = moved.get(c) || []; P(`| ${c} | ${xs.length}${regressed.has(c) ? " ⚠ regression" : ""} | ${Array.from(new Set(xs.map((x) => x.fg_token).filter(Boolean))).slice(0, 12).map(code).join(", ")}${xs.length > 12 ? " …" : ""} |`); }
  P(``);

  if (bf.length) {
    P(`### FAIL rows remaining in \`${CMP_LABEL}\``, ``);
    P(`| context | component | kind | element | fg token → chain | bg token | ratio | thr | note |`, `|---|---|---|---|---|---|---:|---:|---|`);
    for (const r of bf.sort((x, y) => x.context.localeCompare(y.context) || x.component.localeCompare(y.component))) P(`| ${r.context} | ${r.component} | ${r.kind === "text" ? r.subkind : "non-text/" + r.subkind} | ${md(r.element.slice(0, 60))} | ${code(chainOf(r, "fg"))} | ${code(r.bg_token)} | ${r.ratio ?? "—"} | ${r.threshold} | ${regressed.has(r.context) ? "⚠ regression context" : ""} |`);
    P(``);
  }
}

const text = lines.join("\n") + "\n";
if (OUT === "-") process.stdout.write(text); else { fs.writeFileSync(OUT, text); console.error(`wrote ${OUT}`); }
