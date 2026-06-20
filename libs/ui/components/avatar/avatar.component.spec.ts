import { render, screen } from "@testing-library/angular";
import { axe } from "jest-axe";
import { OnyxAvatarComponent } from "./avatar.component";

describe("OnyxAvatarComponent", () => {
  it("renders an image with the name as alt text", async () => {
    await render(
      `<onyx-avatar src="https://example.com/a.png" name="Ada Lovelace" />`,
      { imports: [OnyxAvatarComponent] },
    );
    const img = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(img).toHaveAttribute("src", "https://example.com/a.png");
  });

  it("falls back to initials when there is no image", async () => {
    await render(`<onyx-avatar name="Ada Lovelace" />`, {
      imports: [OnyxAvatarComponent],
    });
    const el = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(el).toHaveTextContent("AL");
  });

  it("derives a single initial from a one-word name", async () => {
    await render(`<onyx-avatar name="Grace" />`, {
      imports: [OnyxAvatarComponent],
    });
    expect(screen.getByRole("img", { name: "Grace" })).toHaveTextContent("G");
  });

  it("shows initials after the image errors", async () => {
    const { container } = await render(
      `<onyx-avatar src="broken.png" name="Ada Lovelace" />`,
      { imports: [OnyxAvatarComponent] },
    );
    const img = container.querySelector("img")!;
    img.dispatchEvent(new Event("error"));
    expect(await screen.findByText("AL")).toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)(
    "has no axe violations (size %s)",
    async (size) => {
      const { container } = await render(
        `<onyx-avatar [size]="size" name="Ada Lovelace" />`,
        { imports: [OnyxAvatarComponent], componentProperties: { size } },
      );
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
