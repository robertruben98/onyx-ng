import { render, screen } from "@testing-library/angular";
import { axe } from "jest-axe";
import { AvatarComponent } from "./avatar.component";

describe("AvatarComponent", () => {
  it("renders an image with the name as alt text", async () => {
    await render(
      `<ui-avatar src="https://example.com/a.png" name="Ada Lovelace" />`,
      { imports: [AvatarComponent] },
    );
    const img = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(img).toHaveAttribute("src", "https://example.com/a.png");
  });

  it("falls back to initials when there is no image", async () => {
    await render(`<ui-avatar name="Ada Lovelace" />`, {
      imports: [AvatarComponent],
    });
    const el = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(el).toHaveTextContent("AL");
  });

  it("derives a single initial from a one-word name", async () => {
    await render(`<ui-avatar name="Grace" />`, {
      imports: [AvatarComponent],
    });
    expect(screen.getByRole("img", { name: "Grace" })).toHaveTextContent("G");
  });

  it("shows initials after the image errors", async () => {
    const { container } = await render(
      `<ui-avatar src="broken.png" name="Ada Lovelace" />`,
      { imports: [AvatarComponent] },
    );
    const img = container.querySelector("img")!;
    img.dispatchEvent(new Event("error"));
    expect(await screen.findByText("AL")).toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)(
    "has no axe violations (size %s)",
    async (size) => {
      const { container } = await render(
        `<ui-avatar [size]="size" name="Ada Lovelace" />`,
        { imports: [AvatarComponent], componentProperties: { size } },
      );
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
