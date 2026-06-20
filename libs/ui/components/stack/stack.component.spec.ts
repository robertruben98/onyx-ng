import { render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { stackDoc } from "./stack.docs";
import {
  OnyxStackComponent,
  StackAlign,
  StackDirection,
  StackGap,
  StackJustify,
} from "./stack.component";

const axeOptions = { rules: { region: { enabled: false } } };

describe("OnyxStackComponent", () => {
  it("projects children in DOM order with token-backed defaults", async () => {
    const { container } = await render(
      `<onyx-stack><span>First</span><span>Second</span></onyx-stack>`,
      { imports: [OnyxStackComponent] },
    );
    const stack = container.querySelector("onyx-stack");

    expect(stack).toHaveClass("ui-stack");
    expect(stack).toHaveAttribute("data-direction", "column");
    expect(stack).toHaveAttribute("data-gap", "md");
    expect(stack).toHaveAttribute("data-align", "stretch");
    expect(stack).toHaveAttribute("data-justify", "start");
    expect(stack).not.toHaveAttribute("data-wrap");
    expect(Array.from(stack?.children ?? [], (child) => child.textContent)).toEqual(
      ["First", "Second"],
    );
  });

  it.each<StackDirection>([
    "row",
    "column",
    "row-reverse",
    "column-reverse",
  ])("exposes the %s direction to styles", async (direction) => {
    const { container } = await render(
      `<onyx-stack [direction]="direction"></onyx-stack>`,
      {
        imports: [OnyxStackComponent],
        componentProperties: { direction },
      },
    );
    expect(container.firstElementChild).toHaveAttribute(
      "data-direction",
      direction,
    );
  });

  it.each<StackGap>(["none", "xs", "sm", "md", "lg", "xl"])(
    "exposes the %s gap token to styles",
    async (gap) => {
      const { container } = await render(
        `<onyx-stack [gap]="gap"></onyx-stack>`,
        {
          imports: [OnyxStackComponent],
          componentProperties: { gap },
        },
      );
      expect(container.firstElementChild).toHaveAttribute("data-gap", gap);
    },
  );

  it.each<StackAlign>(["start", "center", "end", "stretch", "baseline"])(
    "exposes the %s cross-axis alignment to styles",
    async (align) => {
      const { container } = await render(
        `<onyx-stack [align]="align"></onyx-stack>`,
        {
          imports: [OnyxStackComponent],
          componentProperties: { align },
        },
      );
      expect(container.firstElementChild).toHaveAttribute("data-align", align);
    },
  );

  it.each<StackJustify>([
    "start",
    "center",
    "end",
    "space-between",
    "space-around",
    "space-evenly",
  ])("exposes the %s main-axis distribution to styles", async (justify) => {
    const { container } = await render(
      `<onyx-stack [justify]="justify"></onyx-stack>`,
      {
        imports: [OnyxStackComponent],
        componentProperties: { justify },
      },
    );
    expect(container.firstElementChild).toHaveAttribute(
      "data-justify",
      justify,
    );
  });

  it("coerces the wrap attribute with booleanAttribute", async () => {
    const { container } = await render(`<onyx-stack wrap></onyx-stack>`, {
      imports: [OnyxStackComponent],
    });
    expect(container.firstElementChild).toHaveAttribute("data-wrap", "true");
  });

  it("does not add interactive semantics and preserves child keyboard behavior", async () => {
    const user = userEvent.setup();
    const activated = jest.fn();
    const { container } = await render(
      `<onyx-stack>
        <button type="button" (click)="activated()">First</button>
        <button type="button" disabled>Second</button>
      </onyx-stack>`,
      {
        imports: [OnyxStackComponent],
        componentProperties: { activated },
      },
    );
    const stack = container.querySelector("onyx-stack");

    expect(stack).not.toHaveAttribute("role");
    expect(stack).not.toHaveAttribute("tabindex");
    expect(screen.getByRole("button", { name: "Second" })).toBeDisabled();

    await user.tab();
    expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(activated).toHaveBeenCalledTimes(1);
  });

  it("supports consumer-provided list semantics without changing content", async () => {
    const { container } = await render(
      `<onyx-stack role="list" aria-label="Steps">
        <span role="listitem">Plan</span>
        <span role="listitem">Build</span>
      </onyx-stack>`,
      { imports: [OnyxStackComponent] },
    );
    expect(screen.getByRole("list", { name: "Steps" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it.each(["", "onyx-dark", "onyx-theme-acme"])(
    "has no axe violations with neutral layout semantics in the %s theme",
    async (themeClass) => {
      const { container } = await render(
        `<main [class]="themeClass"><onyx-stack direction="row" gap="lg" wrap>
          <button type="button">One</button>
          <button type="button">Two</button>
        </onyx-stack></main>`,
        {
          imports: [OnyxStackComponent],
          componentProperties: { themeClass },
        },
      );
      expect(await axe(container)).toHaveNoViolations();
    },
  );

  it("ships complete docs metadata and demos", () => {
    expect(stackDoc).toMatchObject({
      id: "stack",
      title: "Stack",
      demos: expect.arrayContaining([
        expect.objectContaining({ title: "Direction and gap" }),
        expect.objectContaining({ title: "Wrapping and alignment" }),
      ]),
    });
    expect(stackDoc.api.map(({ name }) => name)).toEqual([
      "direction",
      "gap",
      "align",
      "justify",
      "wrap",
    ]);
  });
});
