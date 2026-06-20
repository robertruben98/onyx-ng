import { render, screen } from "@testing-library/angular";
import { axe } from "jest-axe";
import { OnyxGridComponent, OnyxGridItemDirective } from "./grid.component";

const imports = [OnyxGridComponent, OnyxGridItemDirective];
const axeOptions = { rules: { region: { enabled: false } } };

describe("OnyxGridComponent", () => {
  it("projects content and exposes base layout values", async () => {
    const { container } = await render(
      `<onyx-grid [columns]="3" gap="lg"><article>One</article></onyx-grid>`,
      { imports },
    );

    const grid = container.querySelector("onyx-grid");
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(grid).toHaveStyle("--onyx-grid-columns: 3");
    expect(grid).toHaveClass("onyx-grid-host--gap-lg");
    expect(grid?.querySelector(".onyx-grid")).not.toBeNull();
  });

  it("exposes every responsive column override", async () => {
    const { container } = await render(
      `<onyx-grid
        [columns]="1"
        [columnsSm]="2"
        [columnsMd]="4"
        [columnsLg]="6"
      />`,
      { imports },
    );

    expect(container.querySelector("onyx-grid")).toHaveStyle({
      "--onyx-grid-columns": "1",
      "--onyx-grid-columns-sm": "2",
      "--onyx-grid-columns-md": "4",
      "--onyx-grid-columns-lg": "6",
    });
  });

  it.each(["none", "xs", "sm", "md", "lg", "xl"] as const)(
    "applies the %s gap token class",
    async (gap) => {
      const { container } = await render(`<onyx-grid [gap]="gap" />`, {
        imports,
        componentProperties: { gap },
      });

      expect(container.querySelector("onyx-grid")).toHaveClass(
        `onyx-grid-host--gap-${gap}`,
      );
    },
  );

  it("supports dense placement through a boolean attribute", async () => {
    const { container } = await render(`<onyx-grid dense />`, { imports });
    expect(container.querySelector("onyx-grid")).toHaveClass(
      "onyx-grid-host--dense",
    );
  });

  it("does not add an implicit ARIA role or keyboard behavior", async () => {
    const { container } = await render(
      `<onyx-grid><button>Focusable child</button></onyx-grid>`,
      { imports },
    );

    const grid = container.querySelector("onyx-grid");
    expect(grid).not.toHaveAttribute("role");
    expect(grid).not.toHaveAttribute("tabindex");
    expect(screen.getByRole("button", { name: "Focusable child" })).toBeEnabled();
  });

  it("preserves explicit consumer semantics", async () => {
    await render(
      `<onyx-grid role="list">
        <article role="listitem">Semantic item</article>
      </onyx-grid>`,
      { imports },
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveTextContent("Semantic item");
  });

  it("has no axe violations", async () => {
    const { container } = await render(
      `<onyx-grid [columns]="2">
        <article onyxGridItem>First</article>
        <article onyxGridItem>Second</article>
      </onyx-grid>`,
      { imports },
    );

    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it.each(["", "onyx-dark", "onyx-theme-acme"])(
    "renders accessibly with the %s theme",
    async (themeClass) => {
      const { container } = await render(
        `<section class="${themeClass}">
          <onyx-grid [columns]="2" gap="xl">
            <article>First</article>
            <article>Second</article>
          </onyx-grid>
        </section>`,
        { imports },
      );

      expect(screen.getByText("First")).toBeVisible();
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );
});

describe("OnyxGridItemDirective", () => {
  it("uses a one-column span by default", async () => {
    const { container } = await render(
      `<onyx-grid><article onyxGridItem>Item</article></onyx-grid>`,
      { imports },
    );

    expect(container.querySelector("[onyxGridItem]")).toHaveStyle(
      "--onyx-grid-item-span: span 1",
    );
  });

  it("exposes numeric responsive spans", async () => {
    const { container } = await render(
      `<onyx-grid>
        <article
          onyxGridItem
          [span]="2"
          [spanSm]="3"
          [spanMd]="4"
          [spanLg]="5"
        >
          Item
        </article>
      </onyx-grid>`,
      { imports },
    );

    expect(container.querySelector("[onyxGridItem]")).toHaveStyle({
      "--onyx-grid-item-span": "span 2",
      "--onyx-grid-item-span-sm": "span 3",
      "--onyx-grid-item-span-md": "span 4",
      "--onyx-grid-item-span-lg": "span 5",
    });
  });

  it("supports full-row spans at every breakpoint", async () => {
    const { container } = await render(
      `<onyx-grid>
        <article
          onyxGridItem
          span="full"
          spanSm="full"
          spanMd="full"
          spanLg="full"
        >
          Item
        </article>
      </onyx-grid>`,
      { imports },
    );

    expect(container.querySelector("[onyxGridItem]")).toHaveStyle({
      "--onyx-grid-item-span": "1 / -1",
      "--onyx-grid-item-span-sm": "1 / -1",
      "--onyx-grid-item-span-md": "1 / -1",
      "--onyx-grid-item-span-lg": "1 / -1",
    });
  });

  it("omits unset responsive span overrides", async () => {
    const { container } = await render(
      `<onyx-grid><article onyxGridItem [span]="2">Item</article></onyx-grid>`,
      { imports },
    );
    const item = container.querySelector("[onyxGridItem]") as HTMLElement;

    expect(item.style.getPropertyValue("--onyx-grid-item-span-sm")).toBe("");
    expect(item.style.getPropertyValue("--onyx-grid-item-span-md")).toBe("");
    expect(item.style.getPropertyValue("--onyx-grid-item-span-lg")).toBe("");
  });
});
