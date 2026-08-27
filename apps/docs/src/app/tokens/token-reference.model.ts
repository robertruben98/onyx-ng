/**
 * Shape of the generated token reference (apps/docs/src/app/tokens/
 * token-reference.generated.ts, emitted by libs/ui/tokens/reference.mjs).
 */

/** One preset the token build emits, scoped to `selector`. */
export interface TokenTheme {
  /** Preset name: the file stem under libs/ui/tokens/themes. */
  name: string;
  /** Class selector the preset's declarations are scoped to. */
  selector: string;
  /** Repo-relative source file. */
  source: string;
}

/** A token's binding in one context: what it aliases and what it computes to. */
export interface TokenBinding {
  /**
   * CSS custom property this token aliases (emitted as `var(--ui-…)`), or
   * null when the value is a literal.
   */
  alias: string | null;
  /** Fully resolved value, as the CSS build emits it. */
  value: string;
}

/** One emitted CSS custom property. */
export interface TokenEntry extends TokenBinding {
  /** CSS custom property name, e.g. `--ui-button-bg`. */
  name: string;
  /** Dotted source path, e.g. `button.bg`. */
  path: string;
  /** Source file stem: `primitive`, `semantic` or `component` (CLAUDE.md §3). */
  tier: string;
  /** Repo-relative source file. */
  source: string;
  /**
   * Bindings that differ from the light default, keyed by theme name. A theme
   * that is absent leaves the token exactly as the light default binds it.
   */
  themes: Record<string, TokenBinding>;
}

export interface TokenReference {
  /** Presets in emission order. */
  themes: TokenTheme[];
  /** Every emitted token, grouped by tier in source order. */
  tokens: TokenEntry[];
}
