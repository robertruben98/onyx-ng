/**
 * Token build (ONX-1 finding A-07 / card T1b).
 *
 * Why this is a script and not the old config.json:
 *
 * `outputReferences` emits a component token as an alias — `--ui-card-bg:
 * var(--ui-color-surface)`. Per the CSS custom-property spec that alias is
 * substituted at computed-value time *on the element it is declared on*, and
 * descendants inherit the already-resolved value. So an alias declared once on
 * `:root` can never observe a theme that re-maps the semantic token underneath
 * it: measured in Chromium, `--ui-color-surface` went #ffffff -> #0f172a inside
 * `.app-dark` while `--ui-card-bg` stayed #ffffff. Since every component's SCSS
 * consumes component tokens, dark mode and every client preset were inoperative.
 *
 * Measured on this branch before the fix: 41 of 45 semantic colour tokens change
 * inside .onyx-dark, but only 1 of 142 COMPONENT colour tokens does -- and that
 * one only because dark.css hand-patches it. 21 of 22 themed components were
 * frozen at their light values.
 *
 * The fix is to emit each theme as a COMPLETE token set scoped to its own
 * selector, so the component aliases are re-declared inside the theme and
 * resolve against that theme's semantics. One source of truth stays in JSON;
 * each preset is a small override file under themes/.
 */
import StyleDictionary from "style-dictionary";
import { readdirSync, readFileSync } from "fs";
import { basename, join } from "path";
import { SELECTORS } from "./selectors.mjs";

/**
 * `globSync` from node:fs is Node 22+, and pages.yml runs Node 20, so the Pages
 * job died here while CI (Node 22) stayed green. A design-token build has no
 * business setting a floor on the runtime, so it walks the tree itself.
 */
function jsonFilesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return jsonFilesUnder(path);
    return entry.name.endsWith(".json") ? [path] : [];
  });
}

const TOKENS_DIR = "libs/ui/tokens/tokens";
const THEMES_DIR = "libs/ui/tokens/themes";
const BUILD_PATH = "libs/ui/tokens/dist/";

/**
 * A preset that overrides a token which also has children collapses the whole
 * node, silently destroying the children. `radius` is the live example: the
 * semantic token `radius` and the primitive ramp `radius.{sm,md,full}` share a
 * namespace, so a preset setting `radius` wipes the ramp and the build dies
 * with "4 references could not be found" — which says nothing about the cause.
 * Fail with the actual diagnosis instead.
 */
function readBaseTree() {
  // The RAW token tree, not style-dictionary's processed dictionary: processed
  // leaves carry metadata (filePath, name, attributes...) that would read as
  // children here.
  const merge = (into, from) => {
    for (const [k, v] of Object.entries(from)) {
      if (v && typeof v === "object" && !("value" in v) && into[k])
        merge(into[k], v);
      else into[k] = { ...(into[k] ?? {}), ...v };
    }
    return into;
  };
  return jsonFilesUnder(TOKENS_DIR).reduce(
    (tree, f) => merge(tree, JSON.parse(readFileSync(f, "utf8"))),
    {},
  );
}

function assertNoNodeCollision(overrides, baseTokens, themeName) {
  const walk = (node, path = []) => {
    for (const [key, child] of Object.entries(node)) {
      if (!child || typeof child !== "object") continue;
      const here = [...path, key];
      if ("value" in child) {
        const base = here.reduce((n, k) => (n ? n[k] : undefined), baseTokens);
        const children = base && Object.keys(base).filter((k) => k !== "value");
        if (children && children.length) {
          throw new Error(
            `Preset "${themeName}" overrides "${here.join(".")}", but the base token tree ` +
              `also has ${here.join(".")}.{${children.join(",")}}. Overriding the parent ` +
              `collapses those children and breaks every reference to them. Rename the ` +
              `semantic token so it does not share a namespace with the primitive ramp.`,
          );
        }
      } else {
        walk(child, here);
      }
    }
  };
  walk(overrides);
}

const cssFile = (destination, selector) => ({
  destination,
  format: "css/variables",
  options: { outputReferences: true, selector },
});

/**
 * Flat `path -> unresolved value` view of a merged token tree.
 */
function flatten(node, path = [], out = new Map()) {
  for (const [key, child] of Object.entries(node)) {
    if (!child || typeof child !== "object") continue;
    const here = [...path, key];
    if ("value" in child) out.set(here.join("."), child.value);
    else flatten(child, here, out);
  }
  return out;
}

/**
 * The paths a preset must re-declare: the ones it overrides, plus every token
 * that transitively references one of them.
 *
 * Why the closure is required and not just the overrides: an alias is
 * substituted at computed-value time on the element it is declared on, so
 * `--ui-card-bg: var(--ui-color-surface)` declared once at `:root` can never
 * observe a theme that re-maps the surface underneath it. That is the T1b bug.
 * Re-declaring the alias INSIDE the theme selector is what makes it resolve
 * against that theme -- so every dependant of an overridden token has to come
 * along, at any depth (`focus.ring -> {color.primary}` is a semantic depending
 * on a semantic, not only components depending on semantics).
 *
 * Why NOT the whole set, which is what shipped in W2-1 and is the bug this
 * fixes: two full sets under two single-class selectors have equal specificity,
 * so source order decides WHOLESALE. `.onyx-dark` + `.onyx-theme-acme` rendered
 * as plain acme -- dark silently lost, measured in a browser. Disjoint deltas
 * let the cascade merge them per-property instead: acme carries the brand,
 * dark carries the surfaces, and where both override the same token the later
 * file wins that one property, which is the intended precedence.
 */
function deltaPaths(overrides, merged) {
  const delta = new Set(flatten(overrides).keys());
  for (let grew = true; grew;) {
    grew = false;
    for (const [path, value] of merged) {
      if (delta.has(path)) continue;
      const ref = /^\{([^}]+)\}$/.exec(String(value).trim());
      if (ref && delta.has(ref[1])) {
        delta.add(path);
        grew = true;
      }
    }
  }
  return delta;
}

/**
 * Emits exactly `delta`, keeping every alias as a `var()` reference.
 *
 * A reference whose target is NOT in the delta still resolves correctly: the
 * target is unchanged by this preset, so it is inherited from `:root`. Written
 * by hand rather than via `css/variables` + a filter because filtering that
 * format with `outputReferences: true` throws "references could not be found"
 * the moment a kept token points at a dropped one.
 */
const deltaFormat = ({ dictionary, options }) => {
  const byPath = new Map(
    dictionary.allTokens.map((t) => [t.path.join("."), t]),
  );
  const lines = dictionary.allTokens
    .filter((t) => options.delta.has(t.path.join(".")))
    .map((t) => {
      const ref = /^\{([^}]+)\}$/.exec(String(t.original?.value ?? "").trim());
      const target = ref && byPath.get(ref[1]);
      return `  --${t.name}: ${target ? `var(--${target.name})` : t.value};`;
    });
  return `${options.selector} {\n${lines.join("\n")}\n}\n`;
};

/** Base build: every tier at :root. This is the light default. */
const base = new StyleDictionary({
  source: jsonFilesUnder(TOKENS_DIR),
  platforms: {
    css: {
      transformGroup: "css",
      prefix: "ui",
      buildPath: BUILD_PATH,
      files: [cssFile("tokens.css", ":root")],
    },
  },
});
await base.buildAllPlatforms();

/**
 * Theme builds: the base tokens with the preset's overrides layered on top,
 * emitted under the preset's selector — the COMPLETE set, primitives included.
 * Emitting everything costs a few dozen duplicated primitive declarations per
 * preset and buys two things: every `var()` reference still resolves inside the
 * theme scope, and a preset can re-map a primitive if it ever needs to.
 */
const baseTree = readBaseTree();
const themes = readdirSync(THEMES_DIR).filter((f) => f.endsWith(".json"));

for (const file of themes) {
  const name = basename(file, ".json");
  const selector = SELECTORS[name];
  if (!selector) {
    throw new Error(
      `Theme "${name}" has no selector in build.mjs. Add one to SELECTORS ` +
        `so the preset is actually scoped to something.`,
    );
  }

  assertNoNodeCollision(
    JSON.parse(readFileSync(join(THEMES_DIR, file), "utf8")),
    baseTree,
    name,
  );

  const overrides = JSON.parse(readFileSync(join(THEMES_DIR, file), "utf8"));
  const merged = flatten(readBaseTree());
  for (const [path, value] of flatten(overrides)) merged.set(path, value);
  const delta = deltaPaths(overrides, merged);

  const sd = new StyleDictionary({
    hooks: { formats: { "css/delta": deltaFormat } },
    source: [...jsonFilesUnder(TOKENS_DIR), join(THEMES_DIR, file)],
    platforms: {
      css: {
        transformGroup: "css",
        prefix: "ui",
        buildPath: BUILD_PATH,
        files: [
          {
            destination: `theme-${name}.css`,
            format: "css/delta",
            options: { selector, delta },
          },
        ],
      },
    },
  });
  await sd.buildAllPlatforms();
  console.log(
    `  ${name}: ${delta.size} of ${merged.size} tokens ` +
      `(${flatten(overrides).size} overridden + ${delta.size - flatten(overrides).size} dependants)`,
  );
}

console.log(
  `\nBuilt :root + ${themes.length} theme(s): ${themes.map((f) => basename(f, ".json")).join(", ")}`,
);
