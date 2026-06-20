import { render, screen } from "@testing-library/angular";
import { axe } from "jest-axe";
import { DividerComponent } from "./divider.component";

describe("DividerComponent", () => {
  it("exposes role=separator with horizontal orientation by default", async () => {
    await render(`<onyx-divider />`, { imports: [DividerComponent] });
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("reflects vertical orientation", async () => {
    await render(`<onyx-divider orientation="vertical" />`, {
      imports: [DividerComponent],
    });
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });

  it("renders a label when provided", async () => {
    const { container } = await render(`<onyx-divider label="OR" />`, {
      imports: [DividerComponent],
    });
    expect(screen.getByText("OR")).toBeInTheDocument();
    expect(container.querySelector("onyx-divider")).toHaveClass(
      "ui-divider--labelled",
    );
  });

  it.each([
    ["plain horizontal", `<onyx-divider />`],
    ["vertical", `<onyx-divider orientation="vertical" />`],
    ["labelled", `<onyx-divider label="Section" />`],
  ])("has no axe violations (%s)", async (_name, tpl) => {
    const { container } = await render(tpl, { imports: [DividerComponent] });
    expect(await axe(container)).toHaveNoViolations();
  });
});
