import { render, screen, waitFor } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { InteractivityChecker } from "@angular/cdk/a11y";
import { DialogComponent } from "./dialog.component";

const axeOptions = { rules: { region: { enabled: false } } };

// jsdom has no layout, so CDK's InteractivityChecker treats every element as
// invisible (zero geometry) and the real focus trap can't pick an initial
// target. Neutralize the geometry gate so the genuine CDK focus-trap path runs.
const focusableInTests = {
  provide: InteractivityChecker,
  useValue: {
    isDisabled: () => false,
    isVisible: () => true,
    isTabbable: () => true,
    isFocusable: () => true,
  } as unknown as InteractivityChecker,
};

// Host wires a real trigger button so focus-restoration can be asserted.
const hostTemplate = `
  <button id="trigger" type="button" (click)="open = true">Open</button>
  <ui-dialog
    [(open)]="open"
    [heading]="heading"
    [ariaLabel]="ariaLabel"
    [closeOnEsc]="closeOnEsc"
    [closeOnBackdrop]="closeOnBackdrop"
    (closed)="closed()"
  >
    <p>Dialog body</p>
    <div uiDialogFooter>
      <button type="button" (click)="open = false">Cancel</button>
    </div>
  </ui-dialog>`;

interface HostProps {
  open: boolean;
  heading: string;
  ariaLabel: string;
  closeOnEsc: boolean;
  closeOnBackdrop: boolean;
  closed: () => void;
}

function renderDialog(overrides: Partial<HostProps> = {}) {
  const closed = overrides.closed ?? jest.fn();
  return render(hostTemplate, {
    imports: [DialogComponent],
    providers: [focusableInTests],
    componentProperties: {
      open: false,
      heading: "Confirm",
      ariaLabel: "",
      closeOnEsc: true,
      closeOnBackdrop: true,
      closed,
      ...overrides,
    },
  });
}

describe("DialogComponent", () => {
  it("renders nothing until opened", async () => {
    await renderDialog({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes role=dialog with aria-modal and is labelled by the heading", async () => {
    await renderDialog({ open: true, heading: "Confirm" });
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Confirm");
  });

  it("uses aria-label when no heading is provided", async () => {
    await renderDialog({ open: true, heading: "", ariaLabel: "Settings" });
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleName("Settings");
  });

  it("moves focus into the dialog on open (focus trap)", async () => {
    await renderDialog({ open: true });
    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );
  });

  it("restores focus to the trigger when closed", async () => {
    const user = userEvent.setup();
    await renderDialog({ open: false });
    const trigger = screen.getByRole("button", { name: "Open" });
    trigger.focus();
    await user.click(trigger);

    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("closes on Escape and emits closed", async () => {
    const user = userEvent.setup();
    const closed = jest.fn();
    await renderDialog({ open: true, closed });
    await screen.findByRole("dialog");

    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it("does not close on Escape when closeOnEsc is false", async () => {
    const user = userEvent.setup();
    await renderDialog({ open: true, closeOnEsc: false });
    await screen.findByRole("dialog");

    await user.keyboard("{Escape}");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    await renderDialog({ open: true });
    await screen.findByRole("dialog");

    const backdrop = document.querySelector(
      ".cdk-overlay-backdrop",
    ) as HTMLElement;
    expect(backdrop).toBeTruthy();
    await user.click(backdrop);

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("does not close on backdrop click when closeOnBackdrop is false", async () => {
    const user = userEvent.setup();
    await renderDialog({ open: true, closeOnBackdrop: false });
    await screen.findByRole("dialog");

    const backdrop = document.querySelector(
      ".cdk-overlay-backdrop",
    ) as HTMLElement;
    await user.click(backdrop);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes and emits when the close button is activated", async () => {
    const user = userEvent.setup();
    const closed = jest.fn();
    await renderDialog({ open: true, closed });
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations when open", async () => {
    await renderDialog({ open: true, heading: "Confirm" });
    const dialog = await screen.findByRole("dialog");
    expect(await axe(dialog, axeOptions)).toHaveNoViolations();
  });
});
