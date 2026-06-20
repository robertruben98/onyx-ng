import { render, screen } from "@testing-library/angular";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { OnyxCardComponent } from "./card.component";

// Isolated component not inside a landmark — disable the region rule.
const axeOptions = { rules: { region: { enabled: false } } };

describe("OnyxCardComponent", () => {
  // B1: basic content projection
  it("projects body content into the default slot", async () => {
    await render(`<onyx-card><p>Card body</p></onyx-card>`, {
      imports: [OnyxCardComponent],
    });
    expect(screen.getByText("Card body")).toBeInTheDocument();
  });

  it("projects named header slot", async () => {
    await render(`<onyx-card><span slot="header">My Header</span></onyx-card>`, {
      imports: [OnyxCardComponent],
    });
    expect(screen.getByText("My Header")).toBeInTheDocument();
  });

  it("projects named footer slot", async () => {
    await render(`<onyx-card><span slot="footer">My Footer</span></onyx-card>`, {
      imports: [OnyxCardComponent],
    });
    expect(screen.getByText("My Footer")).toBeInTheDocument();
  });

  // B2: ARIA role
  it('has role="article" by default', async () => {
    await render(`<onyx-card>Content</onyx-card>`, { imports: [OnyxCardComponent] });
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  // B3: interactive mode — clickable with clicked output
  it("emits clicked when interactive card is clicked", async () => {
    const user = userEvent.setup();
    const clicked = jest.fn();
    await render(
      `<onyx-card [interactive]="true" (clicked)="clicked()">Click me</onyx-card>`,
      { imports: [OnyxCardComponent], componentProperties: { clicked } },
    );
    const card = screen.getByRole("article");
    await user.click(card);
    expect(clicked).toHaveBeenCalledTimes(1);
  });

  it("is keyboard focusable and operable (Enter / Space) when interactive", async () => {
    const user = userEvent.setup();
    const clicked = jest.fn();
    await render(
      `<onyx-card [interactive]="true" (clicked)="clicked()">Card</onyx-card>`,
      { imports: [OnyxCardComponent], componentProperties: { clicked } },
    );
    const card = screen.getByRole("article");
    await user.tab();
    expect(card).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(clicked).toHaveBeenCalledTimes(2);
  });

  it("does NOT emit clicked when not interactive", async () => {
    const user = userEvent.setup();
    const clicked = jest.fn();
    await render(`<onyx-card (clicked)="clicked()">Card</onyx-card>`, {
      imports: [OnyxCardComponent],
      componentProperties: { clicked },
    });
    await user.click(screen.getByRole("article"));
    expect(clicked).not.toHaveBeenCalled();
  });

  // B4: disabled state
  it("does NOT emit clicked when interactive but disabled", async () => {
    const user = userEvent.setup();
    const clicked = jest.fn();
    await render(
      `<onyx-card [interactive]="true" [disabled]="true" (clicked)="clicked()">Card</onyx-card>`,
      { imports: [OnyxCardComponent], componentProperties: { clicked } },
    );
    await user.click(screen.getByRole("article"));
    expect(clicked).not.toHaveBeenCalled();
  });

  it("exposes aria-disabled when interactive and disabled", async () => {
    await render(
      `<onyx-card [interactive]="true" [disabled]="true">Card</onyx-card>`,
      { imports: [OnyxCardComponent] },
    );
    const card = screen.getByRole("article");
    expect(card).toHaveAttribute("aria-disabled", "true");
  });

  // B5: axe a11y
  it("has no axe violations (default state)", async () => {
    const { container } = await render(
      `<onyx-card>Default card content</onyx-card>`,
      { imports: [OnyxCardComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (interactive state)", async () => {
    const { container } = await render(
      `<onyx-card [interactive]="true">Interactive card</onyx-card>`,
      { imports: [OnyxCardComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (disabled interactive state)", async () => {
    const { container } = await render(
      `<onyx-card [interactive]="true" [disabled]="true">Disabled card</onyx-card>`,
      { imports: [OnyxCardComponent] },
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
