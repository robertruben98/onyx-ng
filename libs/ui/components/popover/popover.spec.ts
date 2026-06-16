import { render, screen, waitFor } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { PopoverDirective } from "./popover.directive";

const axeOptions = { rules: { region: { enabled: false } } };

const tpl = `
  <button
    type="button"
    [uiPopover]="content"
    uiPopoverLabel="Details"
  >
    Open
  </button>
  <ng-template #content>
    <p>Popover body</p>
    <button type="button">Action</button>
  </ng-template>`;

function renderPopover() {
  return render(tpl, { imports: [PopoverDirective] });
}

describe("PopoverDirective", () => {
  it("is collapsed initially", async () => {
    await renderPopover();
    expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens on click and exposes a labelled dialog", async () => {
    const user = userEvent.setup();
    await renderPopover();
    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog", { name: "Details" });
    expect(dialog).toHaveTextContent("Popover body");
    expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("toggles closed on a second trigger click", async () => {
    const user = userEvent.setup();
    await renderPopover();
    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    await screen.findByRole("dialog");
    await user.click(trigger);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    await renderPopover();
    await user.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("closes on backdrop (outside) click", async () => {
    const user = userEvent.setup();
    await renderPopover();
    await user.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    const backdrop = document.querySelector(
      ".cdk-overlay-backdrop",
    ) as HTMLElement;
    await user.click(backdrop);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    await renderPopover();
    await user.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog");
    expect(await axe(document.body, axeOptions)).toHaveNoViolations();
  });
});
