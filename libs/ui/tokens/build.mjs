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
import StyleDictionary from 'style-dictionary';
import { readdirSync, readFileSync } from 'fs';
import { globSync } from 'fs';
import { basename, join } from 'path';

const TOKENS = 'libs/ui/tokens/tokens/**/*.json';
const THEMES_DIR = 'libs/ui/tokens/themes';
const BUILD_PATH = 'libs/ui/tokens/dist/';

/** Selector each preset is scoped to. A preset with no entry here is a build error. */
const SELECTORS = {
  dark: '.onyx-dark',
  acme: '.onyx-theme-acme'
};


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
      if (v && typeof v === 'object' && !('value' in v) && into[k]) merge(into[k], v);
      else into[k] = { ...(into[k] ?? {}), ...v };
    }
    return into;
  };
  return globSync(TOKENS).reduce(
    (tree, f) => merge(tree, JSON.parse(readFileSync(f, 'utf8'))),
    {}
  );
}

function assertNoNodeCollision(overrides, baseTokens, themeName) {
  const walk = (node, path = []) => {
    for (const [key, child] of Object.entries(node)) {
      if (!child || typeof child !== 'object') continue;
      const here = [...path, key];
      if ('value' in child) {
        const base = here.reduce((n, k) => (n ? n[k] : undefined), baseTokens);
        const children = base && Object.keys(base).filter((k) => k !== 'value');
        if (children && children.length) {
          throw new Error(
            `Preset "${themeName}" overrides "${here.join('.')}", but the base token tree ` +
              `also has ${here.join('.')}.{${children.join(',')}}. Overriding the parent ` +
              `collapses those children and breaks every reference to them. Rename the ` +
              `semantic token so it does not share a namespace with the primitive ramp.`
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
  format: 'css/variables',
  options: { outputReferences: true, selector }
});

/** Base build: every tier at :root. This is the light default. */
const base = new StyleDictionary({
  source: [TOKENS],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: 'ui',
      buildPath: BUILD_PATH,
      files: [cssFile('tokens.css', ':root')]
    }
  }
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
const themes = readdirSync(THEMES_DIR).filter((f) => f.endsWith('.json'));

for (const file of themes) {
  const name = basename(file, '.json');
  const selector = SELECTORS[name];
  if (!selector) {
    throw new Error(
      `Theme "${name}" has no selector in build.mjs. Add one to SELECTORS ` +
        `so the preset is actually scoped to something.`
    );
  }

  assertNoNodeCollision(
    JSON.parse(readFileSync(join(THEMES_DIR, file), 'utf8')),
    baseTree,
    name
  );

  const sd = new StyleDictionary({
    source: [TOKENS, join(THEMES_DIR, file)],
    platforms: {
      css: {
        transformGroup: 'css',
        prefix: 'ui',
        buildPath: BUILD_PATH,
        files: [
          cssFile(`theme-${name}.css`, selector)
        ]
      }
    }
  });
  await sd.buildAllPlatforms();
}

console.log(`\nBuilt :root + ${themes.length} theme(s): ${themes.map((f) => basename(f, '.json')).join(', ')}`);
