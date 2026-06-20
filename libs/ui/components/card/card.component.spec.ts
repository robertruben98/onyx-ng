import { render, screen } from "@testing-library/angular";
import { axe } from "jest-axe";
import { CardComponent } from "./card.component";

const axeOptions = { rules: { region: { enabled: false } } };

describe("CardComponent", () => {
  it("projects default content", async () => {
    await render(`<onyx-card>Body content</onyx-card>`, {
      imports: [CardComponent],
    });
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("projects header and footer slots", async () => {
    await render(
      `<onyx-card>
        <span uiCardHeader>Header</span>
        Body
        <span uiCardFooter>Footer</span>
      </onyx-card>`,
      { imports: [CardComponent] },
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("applies the variant class to the host", async () => {
    const { container } = await render(
      `<onyx-card variant="outlined">Body</onyx-card>`,
      { imports: [CardComponent] },
    );
    expect(container.querySelector("onyx-card")).toHaveClass("ui-card--outlined");
  });

  it.each(["elevated", "outlined"] as const)(
    "has no axe violations (%s)",
    async (variant) => {
      const { container } = await render(
        `<onyx-card [variant]="variant"><span uiCardHeader>Title</span>Content<span uiCardFooter>Actions</span></onyx-card>`,
        { imports: [CardComponent], componentProperties: { variant } },
      );
      expect(await axe(container, axeOptions)).toHaveNoViolations();
    },
  );
});
