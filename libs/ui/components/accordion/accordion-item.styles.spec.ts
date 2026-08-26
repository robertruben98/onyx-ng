import { readFileSync } from "node:fs";
import { join } from "node:path";
import postcssScss from "postcss-scss";
import type { Declaration, Root, Rule } from "postcss";

/**
 * W4-8 — the panel collapses with `grid-template-rows: 0fr`. A `0fr` track can
 * only shrink to the grid item's minimum contribution, and padding is part of
 * that box even with `min-height: 0`: with the padding on the grid item the
 * collapsed track measured 24px in Chrome and the first text line bled out under
 * every collapsed header. The grid item must carry no padding; the padding
 * lives on a wrapper inside it, where the collapsed track clips it away.
 *
 * jsdom has no layout engine, so the geometry is measured in a browser (lane
 * log §W4-8); this spec pins the stylesheet shape that makes it hold.
 */
describe("accordion-item.component.scss — collapsible panel geometry", () => {
  const root: Root = postcssScss.parse(
    readFileSync(join(__dirname, "accordion-item.component.scss"), "utf8"),
  );

  function decls(selector: string): Record<string, string> {
    const out: Record<string, string> = {};
    root.walkRules((rule: Rule) => {
      if (rule.selector !== selector) return;
      rule.walkDecls((decl: Declaration) => {
        out[decl.prop] = decl.value.replace(/\s+/g, " ");
      });
    });
    return out;
  }

  it("keeps the grid item (.ui-accordion-item__body) free of padding so a 0fr track reaches 0", () => {
    const body = decls(".ui-accordion-item__body");
    expect(body["min-height"]).toBe("0");
    expect(body["overflow"]).toBe("hidden");
    expect(Object.keys(body).filter((p) => p.startsWith("padding"))).toEqual(
      [],
    );
  });

  it("puts the panel padding on the inner content wrapper", () => {
    const content = decls(".ui-accordion-item__content");
    expect(content["padding"]).toBe(
      "var(--ui-accordion-panel-padding-y) var(--ui-accordion-panel-padding-x)",
    );
  });
});
