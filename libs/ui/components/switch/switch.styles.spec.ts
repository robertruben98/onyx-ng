import { readFileSync } from "node:fs";
import { join } from "node:path";
import postcssScss from "postcss-scss";
import type { Declaration, Root, Rule } from "postcss";

/**
 * B-04 / W4-3 — the thumb is a bare `::after` painted with `background-color`
 * only, so its colour is the ONLY thing separating it from the track. The OFF
 * and ON tracks sit at opposite luminance ends within every theme, so no single
 * token clears 3:1 on both; the thumb must switch colour with the state.
 *
 * jsdom has no layout engine and jest-preset-angular strips component styles,
 * so this is asserted on the stylesheet itself. The contrast numbers live in the
 * token layer (Jim's WCAG gate) — see the lane log for the measured values.
 */
describe("switch.component.scss — thumb colour per state", () => {
  const root: Root = postcssScss.parse(
    readFileSync(join(__dirname, "switch.component.scss"), "utf8"),
  );

  function thumbBackground(
    selectorPredicate: (sel: string) => boolean,
  ): string[] {
    const values: string[] = [];
    root.walkRules((rule: Rule) => {
      if (!selectorPredicate(rule.selector)) return;
      rule.walkDecls("background-color", (decl: Declaration) => {
        values.push(
          decl.value
            .replace(/\s+/g, " ")
            .replace(/\(\s+/g, "(")
            .replace(/\s+\)/g, ")"),
        );
      });
    });
    return values;
  }

  const isThumb = (sel: string) => sel.includes(".ui-switch__track::after");
  const isCheckedThumb = (sel: string) =>
    isThumb(sel) && sel.includes(":checked");

  it("paints the OFF thumb with the unchecked thumb token", () => {
    const off = thumbBackground(
      (sel) => isThumb(sel) && !sel.includes(":checked"),
    );
    expect(off).toEqual(["var(--ui-switch-thumb-color)"]);
  });

  it("paints the ON (:checked) thumb with its own token, falling back to the OFF token", () => {
    const on = thumbBackground(isCheckedThumb);
    // The fallback keeps today's rendering until the token half lands in the
    // token layer; without it an undefined var() paints the thumb transparent.
    expect(on).toEqual([
      "var(--ui-switch-thumb-color-checked, var(--ui-switch-thumb-color))",
    ]);
  });
});
