import { readFileSync, readdirSync } from "fs";
import { join } from "path";

/**
 * Preset parity (card W2-1, ported from wave-1 A-25).
 *
 * A preset re-skins the library by re-mapping SEMANTIC tokens (CLAUDE.md §7).
 * Nothing checked that a preset actually covered them, and nothing checked that
 * a preset only touched tokens that exist -- so `dark.css` carried a
 * `--ui-tabs-text` override, a COMPONENT token, hand-patched inside the preset
 * to work around the emission bug this card fixes. That kind of drift is
 * invisible until someone reads the file.
 *
 * Asserts on the preset SOURCES, not the emitted CSS: `dist/` is gitignored, so
 * a test reading build output would silently pass wherever the build had not run.
 */

const TOKENS_DIR = join(__dirname, "..", "tokens");
const PRESETS_DIR = __dirname;

type Node = { value?: string } & Record<string, unknown>;

const readJson = (path: string): Node => JSON.parse(readFileSync(path, "utf8"));

function flatten(node: Node, path: string[] = []): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, child] of Object.entries(node)) {
    if (child && typeof child === "object") {
      const branch = child as Node;
      if (typeof branch.value === "string")
        out.set([...path, key].join("."), branch.value);
      else for (const [k, v] of flatten(branch, [...path, key])) out.set(k, v);
    }
  }
  return out;
}

// main's palette families. Colour-ness is derived from the primitive a token
// resolves to, not from its name, so `focus.ring` counts and
// `focus.ring-width` does not, with no hand-maintained list to drift.
const COLOUR_FAMILIES = [
  "amber",
  "black",
  "blue",
  "emerald",
  "green",
  "red",
  "slate",
  "white",
  "yellow",
];


const primitive = flatten(readJson(join(TOKENS_DIR, "primitive.json")));
const semantic = flatten(readJson(join(TOKENS_DIR, "semantic.json")));
const component = flatten(readJson(join(TOKENS_DIR, "component.json")));

/**
 * Resolves through the semantic layer before judging: on main `focus.ring`
 * points at `color.primary`, not at a palette step, so a single-hop check would
 * silently drop it from the set every assertion below depends on.
 */
const isColour = (value: string, seen = new Set<string>()): boolean => {
  const ref = /^\{([^}]+)\}$/.exec(value.trim());
  if (!ref) return false;
  const path = ref[1];
  if (seen.has(path)) return false;
  seen.add(path);
  if (COLOUR_FAMILIES.includes(path.split(".")[0])) return true;
  const next = semantic.get(path);
  return next === undefined ? false : isColour(next, seen);
};
const semanticColours = [...semantic]
  .filter(([, v]) => isColour(v))
  .map(([p]) => p);

const presets = readdirSync(PRESETS_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((file) => ({ file, tokens: flatten(readJson(join(PRESETS_DIR, file))) }));

describe("theme presets", () => {
  it("exposes main's full semantic colour set", () => {
    // Guards the derivation: if this collapses, every assertion below is vacuous.
    expect(semanticColours.length).toBeGreaterThanOrEqual(40);
    expect(semanticColours).toContain("color.primary");
    expect(semanticColours).toContain("color.surface");
    expect(semanticColours).toContain("focus.ring");
    expect(semanticColours).not.toContain("radius");
    expect(semanticColours).not.toContain("focus.ring-width");
  });

  it("ships the presets the build knows about", () => {
    expect(presets.map((p) => p.file).sort()).toEqual([
      "acme.json",
      "dark.json",
    ]);
  });

  describe.each(presets)("$file", ({ tokens }) => {
    it("overrides only tokens that exist in the semantic layer", () => {
      // A component token in a preset is a workaround for a broken chain, and a
      // typo'd name is silently inert. Both are the same class of drift.
      const notSemantic = [...tokens.keys()].filter((p) => !semantic.has(p));
      expect(notSemantic).toEqual([]);
    });

    it("never overrides a token that has children", () => {
      // Overriding a parent collapses its children and breaks every reference
      // to them, with an error that names neither.
      const withChildren = [...tokens.keys()].filter((p) =>
        [...semantic.keys(), ...primitive.keys(), ...component.keys()].some(
          (other) => other.startsWith(`${p}.`),
        ),
      );
      expect(withChildren).toEqual([]);
    });

    it("only references primitives that exist", () => {
      const dangling = [...tokens.values()]
        .filter((v) => v.startsWith("{"))
        .map((v) => v.slice(1, -1))
        .filter((ref) => !primitive.has(ref));
      expect(dangling).toEqual([]);
    });
  });

  describe("dark.json", () => {
    const dark = presets.find((p) => p.file === "dark.json")!.tokens;

    it("maps every semantic colour token", () => {
      const missing = semanticColours.filter((p) => !dark.has(p));
      expect(missing).toEqual([]);
    });

    it("reports which tokens it maps to their light value", () => {
      // Not a failure: a border that is deliberately identical in both themes is
      // a design choice. It is recorded so the choice stays deliberate rather
      // than becoming an unnoticed gap.
      const identical = semanticColours.filter(
        (p) => dark.get(p) === semantic.get(p),
      );
      expect(identical.sort()).toEqual([
        "color.danger-border",
        "color.info-border",
        "color.success-border",
        "color.text-muted",
      ]);
    });
  });
});
