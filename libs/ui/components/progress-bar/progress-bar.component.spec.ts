import { render, screen } from "@testing-library/angular";
import { axe } from "jest-axe";
import { OnyxProgressBarComponent } from "./progress-bar.component";

describe("OnyxProgressBarComponent", () => {
  it("exposes role=progressbar with ARIA value attributes", async () => {
    await render(`<onyx-progress-bar [value]="40" label="Upload" />`, {
      imports: [OnyxProgressBarComponent],
    });
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps the fill width to 0–100%", async () => {
    const { container } = await render(`<onyx-progress-bar [value]="150" />`, {
      imports: [OnyxProgressBarComponent],
    });
    const fill = container.querySelector(".ui-progress__fill") as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });

  it("computes percentage against a custom max", async () => {
    const { container } = await render(
      `<onyx-progress-bar [value]="1" [max]="4" />`,
      { imports: [OnyxProgressBarComponent] },
    );
    const fill = container.querySelector(".ui-progress__fill") as HTMLElement;
    expect(fill.style.width).toBe("25%");
  });

  it("uses the default scale when max is zero", async () => {
    const { container } = await render(
      `<onyx-progress-bar [value]="50" [max]="0" />`,
      { imports: [OnyxProgressBarComponent] },
    );
    const fill = container.querySelector(".ui-progress__fill") as HTMLElement;
    expect(fill.style.width).toBe("50%");
  });

  it("omits aria-valuenow when indeterminate", async () => {
    await render(
      `<onyx-progress-bar [indeterminate]="true" label="Loading" />`,
      {
        imports: [OnyxProgressBarComponent],
      },
    );
    expect(screen.getByRole("progressbar")).not.toHaveAttribute(
      "aria-valuenow",
    );
  });

  it("sets aria-busy=true when indeterminate", async () => {
    await render(
      `<onyx-progress-bar [indeterminate]="true" label="Loading" />`,
      {
        imports: [OnyxProgressBarComponent],
      },
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("does not set aria-busy when determinate", async () => {
    await render(`<onyx-progress-bar [value]="50" label="Progress" />`, {
      imports: [OnyxProgressBarComponent],
    });
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-busy");
  });

  it("sets aria-label from label input", async () => {
    await render(`<onyx-progress-bar [value]="30" label="Loading files" />`, {
      imports: [OnyxProgressBarComponent],
    });
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-label",
      "Loading files",
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
      imports: [OnyxProgressBarComponent],
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
