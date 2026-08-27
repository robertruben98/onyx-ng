import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

/**
 * Preset composition (card W4-1).
 *
 * W2-1 emitted each preset as a COMPLETE token set under its own selector,
 * which fixed the T1b freeze and introduced a worse bug: two full sets under
 * two single-class selectors have equal specificity, so source order decides
 * WHOLESALE. `.onyx-dark` + `.onyx-theme-acme` rendered as plain acme -- dark
 * silently lost, no error anywhere. Presets now emit DELTAS (what they override
 * plus the transitive closure of tokens referencing it), so the cascade merges
 * them per-property.
 *
 * Unlike theme.spec.ts, this has to read the BUILD OUTPUT: the defect lives in
 * what is emitted and in what order, and is invisible in the JSON sources. So
 * it runs the build itself rather than trusting `dist/` to be present -- a spec
 * that reads gitignored output would otherwise pass vacuously wherever the
 * build had not run.
 */

const DIST = join(__dirname, "..", "dist");
const REPO = join(__dirname, "..", "..", "..", "..");

beforeAll(() => {
  execFileSync("node", ["libs/ui/tokens/build.mjs"], {
    cwd: REPO,
    stdio: "pipe",
  });
}, 60_000);

/** Declarations in source order. One flat block per emitted file. */
const declarationsOf = (file: string): Map<string, string> => {
  const path = join(DIST, file);
  if (!existsSync(path)) throw new Error(`${file} was not emitted`);
  const out = new Map<string, string>();
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = /^\s*(--ui-[A-Za-z0-9-]+):\s*(.+?);\s*$/.exec(line);
    if (m) out.set(m[1], m[2].trim());
  }
  return out;
};

const base = () => declarationsOf("tokens.css");
const dark = () => declarationsOf("theme-dark.css");
const acme = () => declarationsOf("theme-acme.css");

/**
 * Both preset selectors are a single class and land on the same element, so for
 * each custom property the winning declaration is simply the last one in
 * stylesheet order. Bundle order is base, dark, acme (angular.json).
 */
const compose = (...layers: Map<string, string>[]): Map<string, string> => {
  const out = new Map<string, string>();
  for (const layer of layers) for (const [k, v] of layer) out.set(k, v);
  return out;
};

const resolve = (
  decls: Map<string, string>,
  name: string,
  seen = new Set<string>(),
): string | undefined => {
  if (seen.has(name)) return undefined;
  seen.add(name);
  const value = decls.get(name);
  if (value === undefined) return undefined;
  const ref = /^var\((--ui-[A-Za-z0-9-]+)\)$/.exec(value);
  return ref ? resolve(decls, ref[1], seen) : value;
};

/** Plain (non-token) declarations of an emitted file, `prop: value` form. */
const plainDeclarationsOf = (file: string): string[] =>
  readFileSync(join(DIST, file), "utf8")
    .split("\n")
    .map((line) => /^\s*([a-z][a-z-]*):\s*(.+?);\s*$/.exec(line))
    .flatMap((m) => (m ? [`${m[1]}: ${m[2]}`] : []));

describe("UA colour scheme", () => {
  it("opts the browser's own controls into the dark palette under .onyx-dark", () => {
    // D-4. Checkbox and radio are native inputs styled through accent-color, so
    // their box, ring and fill are painted by the browser from ITS palette, not
    // from tokens. Without this declaration `color-scheme` computes to `normal`
    // inside .onyx-dark and the browser draws light controls on the dark
    // surface (#ffffff box, #767676 ring on slate.900 -- measured).
    expect(plainDeclarationsOf("theme-dark.css")).toEqual([
      "color-scheme: dark",
    ]);
  });

  it("leaves the base and the brand preset on the browser default", () => {
    // acme is a brand, not a mode: it composes with .onyx-dark, so it must not
    // carry a scheme of its own or it would fight the mode class.
    expect(plainDeclarationsOf("tokens.css")).toEqual([]);
    expect(plainDeclarationsOf("theme-acme.css")).toEqual([]);
  });
});

describe("preset composition", () => {
  it("emits presets as deltas, not as full sets", () => {
    // The regression guard. If a preset ever emits everything again, the two
    // structural assertions below stop meaning anything, because whichever file
    // comes last would win every property regardless of what it overrides.
    expect(acme().size).toBeLessThan(base().size / 2);
    expect(dark().size).toBeLessThan(base().size);
  });

  it("keeps a preset out of the tokens it does not override", () => {
    // This, not source order, is what makes composition work: acme re-maps the
    // brand and says nothing about surfaces, so it CANNOT clobber them.
    const a = acme();
    for (const token of [
      "--ui-color-surface",
      "--ui-color-text",
      "--ui-card-bg",
      "--ui-color-scrim",
    ])
      expect(a.has(token)).toBe(false);
    // ...and dark does own them.
    const d = dark();
    for (const token of ["--ui-color-surface", "--ui-card-bg"])
      expect(d.has(token)).toBe(true);
  });

  it("composes dark + acme: dark surfaces, acme brand", () => {
    // The assertion god asked for: dark+acme card surface == dark card surface.
    // Cross-checked in Chromium over CDP against these same emitted files --
    // custom-property resolution needs no layout, so this model is exact rather
    // than an approximation of a browser.
    const darkOnly = compose(base(), dark());
    const both = compose(base(), dark(), acme());

    expect(resolve(both, "--ui-card-bg")).toBe(
      resolve(darkOnly, "--ui-card-bg"),
    );
    expect(resolve(both, "--ui-color-surface")).toBe("#0f172a");
    expect(resolve(both, "--ui-color-text")).toBe("#f8fafc");
    expect(resolve(both, "--ui-color-scrim")).toBe("rgba(0, 0, 0, 0.64)");
    // The brand is the one thing the client preset SHOULD win.
    expect(resolve(both, "--ui-color-primary")).toBe("#7c3aed");
    expect(resolve(both, "--ui-button-bg")).toBe("#7c3aed");
  });

  it("keeps every alias resolvable inside a preset", () => {
    // A delta that references a token it does not itself declare is fine -- the
    // target is unchanged by this preset and inherits from :root -- but a
    // reference to something that exists NOWHERE would compute to nothing and
    // paint transparent.
    for (const [name, layer] of [
      ["theme-dark.css", dark()],
      ["theme-acme.css", acme()],
    ] as const) {
      const composed = compose(base(), layer);
      const dangling = [...layer.keys()].filter(
        (token) => resolve(composed, token) === undefined,
      );
      expect({ [name]: dangling }).toEqual({ [name]: [] });
    }
  });
});
