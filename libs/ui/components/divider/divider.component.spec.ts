import { render, screen } from "@testing-library/angular";
import { axe } from "jest-axe";
import { OnyxDividerComponent } from "./divider.component";

describe("OnyxDividerComponent", () => {
  it("exposes role=separator with horizontal orientation by default", async () => {
    await render(`<onyx-divider />`, { imports: [OnyxDividerComponent] });
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("reflects vertical orientation", async () => {
    await render(`<onyx-divider orientation="vertical" />`, {
      imports: [OnyxDividerComponent],
    });
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });

  it("renders a label when provided", async () => {
    const { container } = await render(`<onyx-divider label="OR" />`, {
      imports: [OnyxDividerComponent],
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
    const { container } = await render(tpl, { imports: [OnyxDividerComponent] });
    expect(await axe(container)).toHaveNoViolations();
  });
});
