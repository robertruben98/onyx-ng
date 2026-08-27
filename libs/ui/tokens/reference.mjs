/**
 * Token reference generator (card T6).
 *
 * Emits apps/docs/src/app/tokens/token-reference.generated.ts: every token the
 * CSS build emits, with its tier, what it aliases and what it computes to in
 * the light default and inside each preset. The values come from
 * style-dictionary's own resolution over the SAME sources, transform group and
 * prefix build.mjs uses, so the reference cannot drift from the emitted CSS --
 * there is no hand-maintained list to fall behind.
 *
 * Runs after build.mjs as the second half of `npm run build:tokens`. The output
 * is committed (the docs app typechecks, lints and tests without running the
 * token build, like every other gate), and two checks keep it honest: the
 * docs spec regenerates it in-process and compares, and CI diffs the committed
 * file against a fresh build.
 *
 *   node libs/ui/tokens/reference.mjs            write the file
 *   node libs/ui/tokens/reference.mjs --stdout   print it instead (the spec)
 */
import StyleDictionary from "style-dictionary";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { basename, dirname, join } from "path";
import { SELECTORS } from "./selectors.mjs";

const TOKENS_DIR = "libs/ui/tokens/tokens";
const THEMES_DIR = "libs/ui/tokens/themes";
const OUT = "apps/docs/src/app/tokens/token-reference.generated.ts";

/** Tiers in the order CLAUDE.md §3 lists them; anything else sorts after. */
const TIER_ORDER = ["primitive", "semantic", "component"];

/** Same walk as build.mjs, sorted so the emitted order is filesystem-independent. */
function jsonFilesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return jsonFilesUnder(path);
      return entry.name.endsWith(".json") ? [path] : [];
    })
    .sort();
}

/** The css platform exactly as build.mjs configures it, minus the file output. */
async function resolve(sources) {
  const sd = new StyleDictionary({
    source: sources,
    platforms: { css: { transformGroup: "css", prefix: "ui" } },
    // A preset overriding a base token IS a "token collision" to
    // style-dictionary; build.mjs already reports those once per preset, and
    // reference errors still throw with warnings off.
    log: { warnings: "disabled" },
  });
  const { allTokens } = await sd.getPlatformTokens("css");
  return allTokens;
}

const REF = /^\{([^}]+)\}$/;

/**
 * `{ alias, value }` for one resolved token: the CSS custom property it aliases
 * (what `outputReferences` emits as `var(--ui-…)`) or null for a literal, and
 * the fully resolved value.
 */
function binding(token, byPath) {
  const ref = REF.exec(String(token.original?.value ?? "").trim());
  if (!ref) return { alias: null, value: String(token.value) };
  const target = byPath.get(ref[1]);
  if (!target) {
    // style-dictionary resolves references before we get here, so this is a
    // reference it accepted but that no token owns -- report it, do not guess.
    throw new Error(
      `${token.path.join(".")} references {${ref[1]}}, which is not a token.`,
    );
  }
  return { alias: `--${target.name}`, value: String(token.value) };
}

const sameBinding = (a, b) => a.alias === b.alias && a.value === b.value;

const tokenSources = jsonFilesUnder(TOKENS_DIR);
const themeFiles = readdirSync(THEMES_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort();

const light = await resolve(tokenSources);
const lightByPath = new Map(light.map((t) => [t.path.join("."), t]));

const themes = [];
const themeBindings = new Map(); // theme name -> Map(path -> binding)
for (const file of themeFiles) {
  const name = basename(file, ".json");
  const selector = SELECTORS[name];
  if (!selector) {
    throw new Error(
      `Theme "${name}" has no selector in libs/ui/tokens/selectors.mjs.`,
    );
  }
  const resolved = await resolve([...tokenSources, join(THEMES_DIR, file)]);
  const byPath = new Map(resolved.map((t) => [t.path.join("."), t]));
  const extra = [...byPath.keys()].filter((p) => !lightByPath.has(p));
  if (extra.length || byPath.size !== lightByPath.size) {
    // A preset re-maps tokens that exist; one that invents tokens has nothing
    // in the light default to document against. theme.spec.ts asserts the same.
    throw new Error(
      `Theme "${name}" declares tokens the base set does not: ${extra.join(", ") || "(count mismatch)"}.`,
    );
  }
  themes.push({ name, selector, source: join(THEMES_DIR, file) });
  themeBindings.set(
    name,
    new Map([...byPath].map(([path, t]) => [path, binding(t, byPath)])),
  );
}

const tierRank = (tier) => {
  const i = TIER_ORDER.indexOf(tier);
  return i === -1 ? TIER_ORDER.length : i;
};

const tokens = light
  .map((t) => {
    const path = t.path.join(".");
    const base = binding(t, lightByPath);
    const perTheme = {};
    for (const { name } of themes) {
      const b = themeBindings.get(name).get(path);
      if (!sameBinding(b, base)) perTheme[name] = b;
    }
    return {
      name: `--${t.name}`,
      path,
      tier: basename(t.filePath, ".json"),
      source: t.filePath,
      alias: base.alias,
      value: base.value,
      themes: perTheme,
    };
  })
  // Stable: source order is kept inside each tier.
  .sort((a, b) => tierRank(a.tier) - tierRank(b.tier));

const line = (obj) => `    ${JSON.stringify(obj)},`;
const output = `// GENERATED FILE -- DO NOT EDIT BY HAND.
//
// Emitted by libs/ui/tokens/reference.mjs from libs/ui/tokens/{tokens,themes}
// through style-dictionary, with the same transform group and prefix as the
// CSS build, so this reference cannot drift from the emitted tokens.
//
// Regenerate:  npm run build:tokens
// A hand edit or a stale copy fails apps/docs/src/app/tokens/token-reference.spec.ts
// locally and the "Token reference is up to date" step in CI.
import type { TokenReference } from "./token-reference.model";

export const TOKEN_REFERENCE: TokenReference = {
  themes: [
${themes.map(line).join("\n")}
  ],
  tokens: [
${tokens.map(line).join("\n")}
  ],
};
`;

if (process.argv.includes("--stdout")) {
  process.stdout.write(output);
} else {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, output);
  const overridden = themes.map(
    ({ name }) => `${name} ${tokens.filter((t) => name in t.themes).length}`,
  );
  console.log(
    `  reference: ${tokens.length} tokens, ${themes.length} preset(s) ` +
      `(${overridden.join(", ")} differ from light) -> ${OUT}`,
  );
}
