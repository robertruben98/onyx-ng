import { render, screen } from "@testing-library/angular";
import { axe } from "jest-axe";
import { CardComponent } from "./card.component";

const axeOptions = { rules: { region: { enabled: false } } };

describe("CardComponent", () => {
  it("projects default content", async () => {
    await render(`<ui-card>Body content</ui-card>`, {
      imports: [CardComponent],
    });
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("projects header and footer slots", async () => {
    await render(
      `<ui-card>
        <span uiCardHeader>Header</span>
        Body
        <span uiCardFooter>Footer</span>
      </ui-card>`,
      { imports: [CardComponent] },
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("applies the variant class to the host", async () => {
    const { container } = await render(
      `<ui-card variant="outlined">Body</ui-card>`,
      { imports: [CardComponent] },
    );
    expect(container.querySelector("ui-card")).toHaveClass("ui-card--outlined");
  });

  it.each(["elevated", "outlined"] as const)(
    "has no axe violations (%s)",
    async (variant) => {
      const { container } = await render(
        `<ui-card [variant]="variant"><span uiCardHeader>Title</span>Content<span uiCardFooter>Actions</span></ui-card>`,
        { imports: [CardComponent], componentProperties: { variant } },
      );
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );
});
