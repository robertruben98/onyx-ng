import { execFileSync } from "child_process";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { render, screen, fireEvent } from "@testing-library/angular";
import { axe, toHaveNoViolations } from "jest-axe";
import { TOKEN_REFERENCE } from "./token-reference.generated";
import { TokenReferenceComponent } from "./token-reference.component";

expect.extend(toHaveNoViolations);

/**
 * Token reference (card T6).
 *
 * token-reference.generated.ts is committed so the docs app typechecks, lints
 * and tests without running the token build, like every other gate. The price
 * of committing generated output is that it can go stale or be edited by hand,
 * so this spec regenerates it from the current sources and compares. In CI the
 * build has already regenerated the file before jest runs, which is why CI
 * also diffs the committed file against the fresh build in its own step.
 */

const REPO = join(__dirname, "..", "..", "..", "..", "..");
const GENERATED = join(__dirname, "token-reference.generated.ts");
const THEMES_DIR = join(REPO, "libs", "ui", "tokens", "themes");

const generate = (): string =>
  execFileSync("node", ["libs/ui/tokens/reference.mjs", "--stdout"], {
    cwd: REPO,
    stdio: ["ignore", "pipe", "pipe"],
  }).toString("utf8");

const lines = (s: string): string[] => s.split("\n");

describe("token-reference.generated.ts", () => {
  let fresh: string;

  beforeAll(() => {
    fresh = generate();
  }, 60_000);

  it("is exactly what the generator emits from the current token sources", () => {
    // Line arrays so a failure reports the changed token, not two 100 KB blobs.
    expect(lines(readFileSync(GENERATED, "utf8"))).toEqual(lines(fresh));
  });

  it("is reproducible byte for byte", () => {
    expect(generate()).toBe(fresh);
  }, 60_000);

  it("documents every preset the build knows about", () => {
    const presets = readdirSync(THEMES_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .sort();
    expect(TOKEN_REFERENCE.themes.map((t) => t.name)).toEqual(presets);
    for (const theme of TOKEN_REFERENCE.themes)
      expect(theme.selector).toMatch(/^\.[a-z][a-z0-9-]*$/);
  });

  it("names only tokens that exist as alias targets", () => {
    const names = new Set(TOKEN_REFERENCE.tokens.map((t) => t.name));
    expect(names.size).toBe(TOKEN_REFERENCE.tokens.length);
    const dangling: string[] = [];
    for (const token of TOKEN_REFERENCE.tokens) {
      const bindings = [token, ...Object.values(token.themes)];
      for (const b of bindings)
        if (b.alias !== null && !names.has(b.alias))
          dangling.push(`${token.name} -> ${b.alias}`);
    }
    expect(dangling).toEqual([]);
  });

  it("records a theme binding only where it differs from the light default", () => {
    const redundant = TOKEN_REFERENCE.tokens.flatMap((token) =>
      Object.entries(token.themes)
        .filter(([, b]) => b.alias === token.alias && b.value === token.value)
        .map(([theme]) => `${token.name}@${theme}`),
    );
    expect(redundant).toEqual([]);
  });

  it("lists the tiers in the order CLAUDE.md defines them", () => {
    const order = [...new Set(TOKEN_REFERENCE.tokens.map((t) => t.tier))];
    expect(order).toEqual(["primitive", "semantic", "component"]);
  });
});

describe("TokenReferenceComponent", () => {
  const rows = () => document.querySelectorAll(".tier-group tbody tr");

  it("renders one row per emitted token, under its tier", async () => {
    await render(TokenReferenceComponent);
    expect(rows()).toHaveLength(TOKEN_REFERENCE.tokens.length);
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual(
      ["primitive", "semantic", "component"].map((tier) =>
        expect.stringContaining(tier),
      ),
    );
  });

  it("shows each preset with its selector", async () => {
    await render(TokenReferenceComponent);
    for (const theme of TOKEN_REFERENCE.themes) {
      expect(
        screen.getByRole("row", { name: new RegExp(`^${theme.name} `) }),
      ).toHaveTextContent(theme.selector);
    }
  });

  it("marks a themed value as overridden and names its alias", async () => {
    await render(TokenReferenceComponent);
    const primary = screen.getByRole("row", { name: /^--ui-color-primary / });
    // dark re-maps color.primary to a different primitive: alias AND value.
    expect(primary).toHaveTextContent("(overridden)");
    expect(primary).toHaveTextContent(
      TOKEN_REFERENCE.tokens.find((t) => t.name === "--ui-color-primary")!
        .themes["dark"].value,
    );
    expect(primary).toHaveTextContent("via --ui-emerald-400");
  });

  it("filters by name, alias or value and reports the count", async () => {
    await render(TokenReferenceComponent);
    const input = screen.getByLabelText("Filter");
    fireEvent.input(input, { target: { value: "button-bg" } });
    const expected = TOKEN_REFERENCE.tokens.filter(
      (t) => t.name.includes("button-bg") || t.alias?.includes("button-bg"),
    ).length;
    expect(rows()).toHaveLength(expected);
    expect(screen.getByRole("status")).toHaveTextContent(
      `${expected} of ${TOKEN_REFERENCE.tokens.length} shown`,
    );

    fireEvent.input(input, { target: { value: "no-such-token" } });
    expect(rows()).toHaveLength(0);
    expect(screen.getByText(/No tokens match/)).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = await render(TokenReferenceComponent);
    // Filter first: axe over 500 rows of identical structure adds nothing but time.
    fireEvent.input(screen.getByLabelText("Filter"), {
      target: { value: "color-primary" },
    });
    expect(await axe(container)).toHaveNoViolations();
  }, 30_000);
});
