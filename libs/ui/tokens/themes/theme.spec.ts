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
  "black-alpha",
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
  .map((file) => ({
    file,
    tokens: flatten(readJson(join(PRESETS_DIR, file))),
  }));

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

    it("maps no semantic colour token to its light value", () => {
      // These four were the whole tail of the dark theme (W3-1): the three state
      // borders sat at *.600 -- info-border measured 2.18:1 against the dark
      // surface, under the 3:1 minimum for a non-text boundary -- and
      // color.text-muted was slate.400 in BOTH themes, which froze eleven
      // component tokens downstream of it. Empty is now the contract: a preset
      // that re-states a light value is a gap, not a design choice. If one is
      // ever deliberate, add it here with the reason and the measured ratio.
      //
      // color.border-strong (B-36 / W4-2): slate.500 in BOTH themes on purpose.
      // It is the lightest slate step that clears 3:1 from either side --
      // slate.400 is 2.56 on white (light fails), slate.600 is 2.36 on slate.900
      // (dark fails) -- so the same step is the minimum in both directions.
      // Measured: light 4.76 on surface / 4.37 on surface-hover; dark 3.75 on
      // surface / 3.07 on surface-hover. Guarded by the contrast gate below in
      // every theme, so a future lighter dark value cannot pass unnoticed.
      const deliberatelyShared = ["color.border-strong"];
      const identical = semanticColours.filter(
        (p) =>
          dark.get(p) === semantic.get(p) && !deliberatelyShared.includes(p),
      );
      expect(identical.sort()).toEqual([]);
    });
  });
});

/**
 * WCAG contrast gate (card W3-1).
 *
 * The a11y specs use jest-axe under jsdom, which has no layout engine and so can
 * NEVER evaluate `color-contrast` -- every component reported "0 violations"
 * while `color.text-muted` shipped slate.400 at 2.56:1 on white, eight
 * components deep. Ratios are a pure function of the token values, so they can
 * be gated here without a browser, per theme, before a component ever renders.
 *
 * Resolves each pair through the preset overlay so a preset cannot introduce a
 * failing combination that the light theme happens not to have.
 */
const hexOf = (
  path: string,
  overlay: Map<string, string>,
): string | undefined => {
  const seen = new Set<string>();
  let cur: string | undefined = `{${path}}`;
  for (;;) {
    const ref = /^\{([^}]+)\}$/.exec((cur ?? "").trim());
    if (!ref) return cur?.startsWith("#") ? cur : undefined;
    const next = ref[1];
    if (seen.has(next)) return undefined;
    seen.add(next);
    cur =
      overlay.get(next) ??
      semantic.get(next) ??
      component.get(next) ??
      primitive.get(next);
    if (cur === undefined) return undefined;
  }
};

const relativeLuminance = (hex: string): number => {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
};

const contrast = (a: string, b: string): number => {
  const [x, y] = [relativeLuminance(a), relativeLuminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/** Body text and its background: WCAG 1.4.3 Contrast (Minimum), AA. */
const TEXT_PAIRS: [string, string][] = [
  ["color.text", "color.surface"],
  ["color.text-muted", "color.surface"],
  ["color.text-placeholder", "color.surface"],
  ["color.neutral", "color.surface"],
  ["color.on-primary", "color.primary"],
  ["color.danger-text", "color.danger-surface"],
  ["color.success-text", "color.success-surface"],
  ["color.warning-text", "color.warning-surface"],
  ["color.info-text", "color.info-surface"],
  ["color.badge-danger-text", "color.badge-danger-bg"],
  ["color.badge-success-text", "color.badge-success-bg"],
  ["color.badge-warning-text", "color.badge-warning-bg"],
  ["color.badge-info-text", "color.badge-info-bg"],
  ["color.badge-neutral-text", "color.badge-neutral-bg"],
];

/**
 * Boundaries a user must see to identify or operate a control: WCAG 1.4.11
 * Non-text Contrast, 3:1.
 *
 * Two pairs are deliberately absent, and both are exemptions rather than
 * oversights. `color.disabled-text` on `color.disabled-bg` measures 2.34:1 in
 * light and 3.07:1 in dark: 1.4.3 exempts text in an inactive control, and
 * dimming IS the affordance -- raising it to AA would make disabled look
 * enabled. `color.border` on `color.surface` is a 1.23:1 hairline: 1.4.11
 * covers boundaries *required* to identify a component, not decorative rules.
 * The control boundaries themselves are `color.border-strong` (B-36 / W4-2):
 * before that token existed, `color.border` WAS the resting edge of input,
 * textarea, select and the switch OFF track, measured at 1.23:1 (light, acme)
 * and 1.72:1 (dark) against the surface each one sits on -- and since every
 * control fill is `color.surface` too (inside/outside 1.00), that hairline
 * was the only thing identifying the control. Gated below against both
 * surfaces a resting control can sit on.
 */
const NON_TEXT_PAIRS: [string, string][] = [
  ["color.info-border", "color.info-surface"],
  ["color.success-border", "color.success-surface"],
  ["color.danger-border", "color.danger-surface"],
  ["color.warning-border", "color.warning-surface"],
  ["focus.ring", "color.surface"],
  // Resting control boundary (B-36 / W4-2A). Measured on main@b747059 with
  // painted pixels and computed styles agreeing: slate.200 on white 1.23,
  // slate.700 on slate.900 1.72. `surface-hover` is the second denominator a
  // resting control sits on (table header, hovered rows/options); in dark it is
  // the tight cell -- slate.500 on slate.800 = 3.07.
  ["color.border-strong", "color.surface"],
  ["color.border-strong", "color.surface-hover"],
  // The knob against the track it actually sits on, per state (B-04 / W4-3).
  // A single token cannot satisfy both rows: off and on tracks sit at opposite
  // ends of the luminance range inside each theme, which is why there are two.
  //
  // With main's single `{white}` thumb, THREE of the six cells failed, and they
  // were not all in one theme -- Dwight measured the one I had mis-stated as
  // light-only: light OFF 1.23 (on slate.200), acme OFF 1.23, and dark ON
  // 1.92 (white on emerald.400). An ON switch in dark was as invisible as an
  // OFF switch in light. Both pairs therefore need their own mutation to be
  // negative-checked; reverting only `thumb-color` leaves the dark ON cell
  // untested, because that cell is governed by `thumb-color-checked`.
  ["switch.thumb-color", "switch.track-bg"],
  ["switch.thumb-color-checked", "switch.track-bg-checked"],
];

/**
 * The structural half of CLAUDE.md §3: a component token maps to a SEMANTIC, so
 * that re-skinning a client never means editing a component. Colour obeyed this
 * already; corners did not. 20 of the 28 component corner tokens referenced the
 * `{radii.*}` ramp directly, so `--ui-radius` reached only 8 of them and a
 * preset asking for pill corners got a UI that was pill in eight places and
 * default everywhere else. Gated by tier, not by name, so a new component that
 * reaches past the semantic layer fails here rather than at review.
 */
describe("component tokens reference the semantic layer", () => {
  it("never reaches a colour primitive", () => {
    // No exemptions. `switch.thumb-color` was the last one and it was not a
    // naming problem: the thumb is a bare ::after with background-color only,
    // so `{white}` measured 1.23:1 on the light unchecked track -- an invisible
    // knob (B-04). No SINGLE token can fix it, because the off and on tracks sit
    // at opposite ends of the luminance range within each theme, so it took two.
    const direct = [...component]
      .filter(([, value]) =>
        COLOUR_FAMILIES.includes(
          (/^\{([^}]+)\}$/.exec(value.trim())?.[1] ?? "").split(".")[0],
        ),
      )
      .map(([path]) => path);
    expect(direct).toEqual([]);
  });

  it("never reaches the radii ramp", () => {
    const direct = [...component]
      .filter(([, value]) => /^\{radii\./.test(value.trim()))
      .map(([path]) => path);
    expect(direct).toEqual([]);
  });

  it("routes every corner through the semantic radius scale", () => {
    // Guards the assertion above from passing because the set went empty.
    const corners = [...component].filter(([path]) => /radius/.test(path));
    expect(corners.length).toBeGreaterThanOrEqual(28);
    const scale = new Set([
      "radius-sm",
      "radius",
      "radius-lg",
      "radius-xl",
      "radius-pill",
    ]);
    const offScale = corners
      .filter(([, v]) => !scale.has(/^\{([^}]+)\}$/.exec(v.trim())?.[1] ?? ""))
      .map(([path]) => path);
    expect(offScale).toEqual([]);
  });

  it("keeps the scale flat so a preset cannot collapse it", () => {
    // `radius` is public API as --ui-radius and already a leaf. Nesting the ramp
    // under it would collapse that leaf -- the parent-override trap build.mjs
    // diagnoses. Siblings cannot collide.
    const nested = [...semantic.keys()].filter((p) => p.startsWith("radius."));
    expect(nested).toEqual([]);
  });
});

describe("contrast", () => {
  // The light theme is the base token set with no overlay.
  const themes: [string, Map<string, string>][] = [
    ["light", new Map<string, string>()],
    ...presets.map(
      ({ file, tokens }) =>
        [file.replace(/\.json$/, ""), tokens] as [string, Map<string, string>],
    ),
  ];

  describe.each(themes)("%s", (_name, overlay) => {
    it("resolves every gated pair to a hex colour", () => {
      // Without this the assertions below pass vacuously on a typo'd token name.
      const unresolved = [...TEXT_PAIRS, ...NON_TEXT_PAIRS]
        .flat()
        .filter((path) => hexOf(path, overlay) === undefined);
      expect(unresolved).toEqual([]);
    });

    it.each(TEXT_PAIRS)("%s on %s reaches AA 4.5:1", (fg, bg) => {
      const ratio = contrast(hexOf(fg, overlay)!, hexOf(bg, overlay)!);
      expect(Number(ratio.toFixed(2))).toBeGreaterThanOrEqual(4.5);
    });

    it.each(NON_TEXT_PAIRS)("%s on %s reaches 3:1", (fg, bg) => {
      const ratio = contrast(hexOf(fg, overlay)!, hexOf(bg, overlay)!);
      expect(Number(ratio.toFixed(2))).toBeGreaterThanOrEqual(3);
    });
  });
});
