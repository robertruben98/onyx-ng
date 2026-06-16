import { render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { TagComponent } from "./tag.component";

const axeOptions = { rules: { region: { enabled: false } } };

describe("TagComponent", () => {
  it("projects its content", async () => {
    await render(`<ui-tag>Frontend</ui-tag>`, { imports: [TagComponent] });
    expect(screen.getByText("Frontend")).toBeInTheDocument();
  });

  it("has no remove button unless removable", async () => {
    await render(`<ui-tag>Tag</ui-tag>`, { imports: [TagComponent] });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("emits removed when the remove button is clicked", async () => {
    const user = userEvent.setup();
    const removed = jest.fn();
    await render(
      `<ui-tag [removable]="true" removeLabel="Quitar" (removed)="removed()">Tag</ui-tag>`,
      { imports: [TagComponent], componentProperties: { removed } },
    );
    await user.click(screen.getByRole("button", { name: /quitar/i }));
    expect(removed).toHaveBeenCalledTimes(1);
  });

  it("remove button is keyboard operable", async () => {
    const user = userEvent.setup();
    const removed = jest.fn();
    await render(
      `<ui-tag [removable]="true" (removed)="removed()">Tag</ui-tag>`,
      { imports: [TagComponent], componentProperties: { removed } },
    );
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(removed).toHaveBeenCalledTimes(1);
  });

  it.each(["neutral", "info", "success", "warning", "danger"] as const)(
    "has no axe violations (%s)",
    async (variant) => {
      const { container } = await render(
        `<ui-tag [variant]="variant" [removable]="true">Tag</ui-tag>`,
        { imports: [TagComponent], componentProperties: { variant } },
      );
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );
});
