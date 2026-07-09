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

  it("renders an empty fallback when the name has no non-space parts", async () => {
    const { container } = await render(`<onyx-avatar name="   " />`, {
      imports: [OnyxAvatarComponent],
    });
    expect(container.querySelector(".ui-avatar__initials")).toHaveTextContent(
      "",
    );
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

  it("has no status dot by default", async () => {
    const { container } = await render(`<onyx-avatar name="Ada Lovelace" />`, {
      imports: [OnyxAvatarComponent],
    });
    expect(container.querySelector(".ui-avatar__status")).toBeNull();
  });

  it("renders a labelled status dot when status is set", async () => {
    const { container } = await render(
      `<onyx-avatar name="Ada Lovelace" status="online" />`,
      { imports: [OnyxAvatarComponent] },
    );
    const dot = container.querySelector(".ui-avatar__status")!;
    expect(dot).toHaveAttribute("data-status", "online");
    expect(dot).toHaveAttribute("aria-label", "Online");
    expect(screen.getByRole("img", { name: "Online" })).toBe(dot);
  });

  it.each([
    ["online", "Online"],
    ["offline", "Offline"],
    ["away", "Away"],
    ["busy", "Busy"],
  ] as const)("labels the %s status as %s", async (status, label) => {
    await render(`<onyx-avatar name="Ada Lovelace" [status]="status" />`, {
      imports: [OnyxAvatarComponent],
      componentProperties: { status },
    });
    expect(screen.getByRole("img", { name: label })).toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)(
    "has no axe violations (size %s)",
    async (size) => {
      const { container } = await render(
        `<onyx-avatar [size]="size" name="Ada Lovelace" status="online" />`,
        { imports: [OnyxAvatarComponent], componentProperties: { size } },
      );
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
