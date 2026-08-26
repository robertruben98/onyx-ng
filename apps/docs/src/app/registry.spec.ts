import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { COMPONENT_DOCS } from "./registry";

/**
 * The registry must cover the public component library — checked as a
 * mechanism, not a snapshot. Every `export * from "./<dir>"` in
 * libs/ui/components/index.ts is a public component whose page lives at
 * /components/<dir>, so `<dir>` must be a registered ComponentDoc id. Adding a
 * component to the barrel without a .docs.ts entry fails here.
 */
const BARREL = resolve(__dirname, "../../../../libs/ui/components/index.ts");

function barrelExports(): string[] {
  const source = readFileSync(BARREL, "utf8");
  return [...source.matchAll(/from\s+["']\.\/([^"'/]+)["']/g)].map((m) => m[1]);
}

describe("COMPONENT_DOCS registry", () => {
  const exported = barrelExports();
  const ids = COMPONENT_DOCS.map((doc) => doc.id);

  it("reads the @onyx/ui/components barrel", () => {
    expect(exported.length).toBeGreaterThan(0);
  });

  it("documents every component exported from @onyx/ui/components", () => {
    const undocumented = exported.filter((dir) => !ids.includes(dir));
    expect(undocumented).toEqual([]);
  });

  it("does not document components the barrel does not export", () => {
    const orphans = ids.filter((id) => !exported.includes(id));
    expect(orphans).toEqual([]);
  });

  it("uses unique ids (they are route segments)", () => {
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every component at least one live demo", () => {
    const withoutDemo = COMPONENT_DOCS.filter((doc) => doc.demos.length === 0);
    expect(withoutDemo.map((doc) => doc.id)).toEqual([]);
  });
});
