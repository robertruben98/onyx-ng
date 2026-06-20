import { TestBed } from "@angular/core/testing";
import { render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { emptyStateDemos } from "./empty-state.demos";
import { emptyStateDoc } from "./empty-state.docs";
import { OnyxEmptyStateComponent } from "./index";

const axeOptions = { rules: { region: { enabled: false } } };

const completeTemplate = `<onyx-empty-state
  (primaryAction)="primaryAction($event)"
  (secondaryAction)="secondaryAction($event)"
>
  <svg slot="illustration" data-testid="illustration"></svg>
  <span slot="title">No results</span>
  <span slot="description">Try changing your filters.</span>
  <span slot="primary-action">Clear filters</span>
  <span slot="secondary-action">Go back</span>
</onyx-empty-state>`;

describe("OnyxEmptyStateComponent", () => {
  it("projects the visual, title, description, and action slots", async () => {
    await render(completeTemplate, {
      imports: [OnyxEmptyStateComponent],
      componentProperties: {
        primaryAction: jest.fn(),
        secondaryAction: jest.fn(),
      },
    });

    const region = screen.getByRole("region", { name: "No results" });
    const title = screen.getByText("No results");
    const description = screen.getByText("Try changing your filters.");

    expect(region).toHaveAttribute(
      "aria-labelledby",
      title.closest("h2")?.id,
    );
    expect(region).toHaveAttribute(
      "aria-describedby",
      description.closest("p")?.id,
    );
    expect(screen.getByTestId("illustration").parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(
      await screen.findByRole("button", { name: "Clear filters" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Go back" }),
    ).toBeInTheDocument();
  });

  it("uses ariaLabel instead of the title slot and supports status semantics", async () => {
    await render(
      `<onyx-empty-state role="status" ariaLabel="Filtered results">
        <span slot="title">Nothing matched</span>
      </onyx-empty-state>`,
      { imports: [OnyxEmptyStateComponent] },
    );

    const status = screen.getByRole("status", { name: "Filtered results" });
    expect(status).not.toHaveAttribute("aria-labelledby");
    expect(status).toHaveAttribute("aria-atomic", "true");
  });

  it("emits both action outputs on pointer activation", async () => {
    const user = userEvent.setup();
    const primaryAction = jest.fn();
    const secondaryAction = jest.fn();
    await render(completeTemplate, {
      imports: [OnyxEmptyStateComponent],
      componentProperties: { primaryAction, secondaryAction },
    });

    await user.click(
      await screen.findByRole("button", { name: "Clear filters" }),
    );
    await user.click(await screen.findByRole("button", { name: "Go back" }));

    expect(primaryAction).toHaveBeenCalledTimes(1);
    expect(primaryAction).toHaveBeenCalledWith(expect.any(MouseEvent));
    expect(secondaryAction).toHaveBeenCalledTimes(1);
    expect(secondaryAction).toHaveBeenCalledWith(expect.any(MouseEvent));
  });

  it("supports native Enter and Space keyboard activation", async () => {
    const user = userEvent.setup();
    const primaryAction = jest.fn();
    const secondaryAction = jest.fn();
    await render(completeTemplate, {
      imports: [OnyxEmptyStateComponent],
      componentProperties: { primaryAction, secondaryAction },
    });

    await user.tab();
    expect(
      screen.getByRole("button", { name: "Clear filters" }),
    ).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.tab();
    expect(screen.getByRole("button", { name: "Go back" })).toHaveFocus();
    await user.keyboard(" ");

    expect(primaryAction).toHaveBeenCalledTimes(1);
    expect(secondaryAction).toHaveBeenCalledTimes(1);
  });

  it("disables actions through the boolean input", async () => {
    const user = userEvent.setup();
    const primaryAction = jest.fn();
    const secondaryAction = jest.fn();
    await render(
      `<onyx-empty-state
        disabled
        (primaryAction)="primaryAction($event)"
        (secondaryAction)="secondaryAction($event)"
      >
        <span slot="title">Offline</span>
        <span slot="primary-action">Retry</span>
        <span slot="secondary-action">Cancel</span>
      </onyx-empty-state>`,
      {
        imports: [OnyxEmptyStateComponent],
        componentProperties: { primaryAction, secondaryAction },
      },
    );

    const region = screen.getByRole("region", { name: "Offline" });
    const retry = await screen.findByRole("button", { name: "Retry" });
    const cancel = await screen.findByRole("button", { name: "Cancel" });

    expect(region).toHaveAttribute("aria-disabled", "true");
    expect(retry).toBeDisabled();
    expect(cancel).toBeDisabled();
    await user.click(retry);
    await user.click(cancel);
    await user.tab();
    expect(retry).not.toHaveFocus();
    expect(cancel).not.toHaveFocus();
    expect(primaryAction).not.toHaveBeenCalled();
    expect(secondaryAction).not.toHaveBeenCalled();
  });

  it("does not expose empty optional action buttons", async () => {
    await render(`<onyx-empty-state ariaLabel="Empty" />`, {
      imports: [OnyxEmptyStateComponent],
    });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("has no axe violations in the interactive state", async () => {
    const interactive = await render(completeTemplate, {
      imports: [OnyxEmptyStateComponent],
      componentProperties: {
        primaryAction: jest.fn(),
        secondaryAction: jest.fn(),
      },
    });
    await screen.findByRole("button", { name: "Clear filters" });
    expect(await axe(interactive.container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations in the disabled state", async () => {
    const disabled = await render(
      `<onyx-empty-state disabled>
        <span slot="title">No connection</span>
        <span slot="description">Reconnect to continue.</span>
        <span slot="primary-action">Reconnect</span>
      </onyx-empty-state>`,
      { imports: [OnyxEmptyStateComponent] },
    );
    await screen.findByRole("button", { name: "Reconnect" });
    expect(await axe(disabled.container, axeOptions)).toHaveNoViolations();
  });

  it("registers complete docs and renderable demos", () => {
    expect(emptyStateDoc.id).toBe("empty-state");
    expect(emptyStateDoc.demos).toBe(emptyStateDemos);
    expect(emptyStateDoc.api).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "(primaryAction)" }),
        expect.objectContaining({ name: "Slots" }),
      ]),
    );

    for (const demo of emptyStateDemos) {
      const fixture = TestBed.createComponent(demo.component);
      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveTextContent(
        demo.title === "Illustration and status"
          ? "You're all caught up"
          : demo.title === "Disabled actions"
            ? "Service unavailable"
            : "No projects yet",
      );
      fixture.destroy();
    }
  });
});
