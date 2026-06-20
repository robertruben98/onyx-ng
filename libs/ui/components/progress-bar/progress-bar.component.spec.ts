import { render, screen } from "@testing-library/angular";
import { axe } from "jest-axe";
import { ProgressBarComponent } from "./progress-bar.component";

describe("ProgressBarComponent", () => {
  it("exposes role=progressbar with ARIA value attributes", async () => {
    await render(`<onyx-progress-bar [value]="40" label="Upload" />`, {
      imports: [ProgressBarComponent],
    });
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps the fill width to 0–100%", async () => {
    const { container } = await render(`<onyx-progress-bar [value]="150" />`, {
      imports: [ProgressBarComponent],
    });
    const fill = container.querySelector(".ui-progress__fill") as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });

  it("computes percentage against a custom max", async () => {
    const { container } = await render(
      `<onyx-progress-bar [value]="1" [max]="4" />`,
      { imports: [ProgressBarComponent] },
    );
    const fill = container.querySelector(".ui-progress__fill") as HTMLElement;
    expect(fill.style.width).toBe("25%");
  });

  it("omits aria-valuenow when indeterminate", async () => {
    await render(`<onyx-progress-bar [indeterminate]="true" label="Loading" />`, {
      imports: [ProgressBarComponent],
    });
    expect(screen.getByRole("progressbar")).not.toHaveAttribute(
      "aria-valuenow",
    );
  });

  it.each([
    ["determinate", `<onyx-progress-bar [value]="60" label="Progress" />`],
    [
      "indeterminate",
      `<onyx-progress-bar [indeterminate]="true" label="Loading" />`,
    ],
  ])("has no axe violations (%s)", async (_name, tpl) => {
    const { container } = await render(tpl, {
      imports: [ProgressBarComponent],
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
