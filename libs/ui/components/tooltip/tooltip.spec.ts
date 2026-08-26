import { render, screen, waitFor } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { OnyxTooltipDirective } from "./tooltip.directive";

const tpl = `<button type="button" [onyxTooltip]="text">Hover me</button>`;

function renderTooltip(text = "Helpful hint") {
  return render(tpl, {
    imports: [OnyxTooltipDirective],
    componentProperties: { text },
  });
}

describe("OnyxTooltipDirective", () => {
  it("shows a tooltip on hover and wires aria-describedby", async () => {
    const user = userEvent.setup();
    await renderTooltip("Helpful hint");
    const trigger = screen.getByRole("button", { name: "Hover me" });

    await user.hover(trigger);

    const tip = await screen.findByRole("tooltip");
    expect(tip).toHaveTextContent("Helpful hint");
    expect(trigger.getAttribute("aria-describedby")).toBe(tip.id);
  });

  it("hides the tooltip on unhover", async () => {
    const user = userEvent.setup();
    await renderTooltip();
    const trigger = screen.getByRole("button");
    await user.hover(trigger);
    await screen.findByRole("tooltip");
    await user.unhover(trigger);
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
    );
    expect(trigger).not.toHaveAttribute("aria-describedby");
  });

  // B-11: the trigger may already be described by something else (a hint,
  // helper text). The tooltip must add/remove ONLY its own id in that list.
  it("preserves a pre-existing aria-describedby on the trigger", async () => {
    const user = userEvent.setup();
    await render(
      `<button type="button" aria-describedby="hint" [onyxTooltip]="text">Hover me</button>
       <p id="hint">Existing hint</p>`,
      { imports: [OnyxTooltipDirective], componentProperties: { text: "Tip" } },
    );
    const trigger = screen.getByRole("button", { name: "Hover me" });
    expect(trigger).toHaveAttribute("aria-describedby", "hint");

    await user.hover(trigger);
    const tip = await screen.findByRole("tooltip");
    const during = trigger.getAttribute("aria-describedby")!.split(/\s+/);
    expect(during).toContain("hint");
    expect(during).toContain(tip.id);

    await user.unhover(trigger);
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveAttribute("aria-describedby", "hint");
  });

  it("shows on focus and hides on Escape", async () => {
    const user = userEvent.setup();
    await renderTooltip();
    const trigger = screen.getByRole("button");
    trigger.focus();
    trigger.dispatchEvent(new FocusEvent("focus"));
    await screen.findByRole("tooltip");
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
    );
  });

  it("has no axe violations while shown", async () => {
    const user = userEvent.setup();
    await renderTooltip();
    await user.hover(screen.getByRole("button"));
    await screen.findByRole("tooltip");
    expect(
      await axe(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
