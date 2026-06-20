import { render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { OnyxButtonComponent } from "./button.component";

// Component-level axe runs: the host is not inside a landmark, which is fine
// for an isolated component, so the page-level "region" rule is disabled.
const axeOptions = { rules: { region: { enabled: false } } };

describe("OnyxButtonComponent", () => {
  it("projects content with an accessible name", async () => {
    await render(`<onyx-button>Save</onyx-button>`, {
      imports: [OnyxButtonComponent],
    });
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("emits clicked when activated by pointer", async () => {
    const user = userEvent.setup();
    const clicked = jest.fn();
    await render(`<onyx-button (clicked)="clicked()">Save</onyx-button>`, {
      imports: [OnyxButtonComponent],
      componentProperties: { clicked },
    });
    await user.click(screen.getByRole("button"));
    expect(clicked).toHaveBeenCalledTimes(1);
  });

  it("is reachable and operable by keyboard (Enter and Space)", async () => {
    const user = userEvent.setup();
    const clicked = jest.fn();
    await render(`<onyx-button (clicked)="clicked()">Save</onyx-button>`, {
      imports: [OnyxButtonComponent],
      componentProperties: { clicked },
    });
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(clicked).toHaveBeenCalledTimes(2);
  });

  it("does NOT emit clicked when disabled", async () => {
    const clicked = jest.fn();
    await render(
      `<onyx-button [disabled]="true" (clicked)="clicked()">Save</onyx-button>`,
      {
        imports: [OnyxButtonComponent],
        componentProperties: { clicked },
      },
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    btn.click();
    expect(clicked).not.toHaveBeenCalled();
  });

  it("does NOT emit clicked when loading and exposes aria-busy", async () => {
    const clicked = jest.fn();
    await render(
      `<onyx-button [loading]="true" (clicked)="clicked()">Save</onyx-button>`,
      {
        imports: [OnyxButtonComponent],
        componentProperties: { clicked },
      },
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-busy", "true");
    btn.click();
    expect(clicked).not.toHaveBeenCalled();
  });

  it("loading state uses aria-disabled (not native disabled) so aria-busy is announced", async () => {
    await render(`<onyx-button [loading]="true">Saving</onyx-button>`, {
      imports: [OnyxButtonComponent],
    });
    const btn = screen.getByRole("button");
    // Must NOT have native disabled (so AT can still announce aria-busy)
    expect(btn).not.toBeDisabled();
    // Must carry aria-disabled and aria-busy
    expect(btn).toHaveAttribute("aria-disabled", "true");
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("disabled input still sets native disabled (unchanged behaviour)", async () => {
    await render(`<onyx-button [disabled]="true">Save</onyx-button>`, {
      imports: [OnyxButtonComponent],
    });
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it.each(["primary", "secondary", "text"] as const)(
    "has no axe violations (%s variant)",
    async (variant) => {
      const { container } = await render(
        `<onyx-button [variant]="variant">Save</onyx-button>`,
        { imports: [OnyxButtonComponent], componentProperties: { variant } },
      );
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );

  it("has no axe violations while loading", async () => {
    const { container } = await render(
      `<onyx-button [loading]="true">Saving</onyx-button>`,
      { imports: [OnyxButtonComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
