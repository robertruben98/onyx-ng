import { render, screen } from "@testing-library/angular";
import { axe } from "jest-axe";
import { SpinnerComponent } from "./spinner.component";

describe("SpinnerComponent", () => {
  it("exposes role=status with a default label", async () => {
    await render(`<onyx-spinner />`, { imports: [SpinnerComponent] });
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading");
  });

  it("uses a custom label", async () => {
    await render(`<onyx-spinner label="Cargando" />`, {
      imports: [SpinnerComponent],
    });
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Cargando",
    );
  });

  it("applies the size class", async () => {
    const { container } = await render(`<onyx-spinner size="lg" />`, {
      imports: [SpinnerComponent],
    });
    expect(container.querySelector("onyx-spinner")).toHaveClass("ui-spinner--lg");
  });

  it.each(["sm", "md", "lg"] as const)(
    "has no axe violations (size %s)",
    async (size) => {
      const { container } = await render(`<onyx-spinner [size]="size" />`, {
        imports: [SpinnerComponent],
        componentProperties: { size },
      });
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
