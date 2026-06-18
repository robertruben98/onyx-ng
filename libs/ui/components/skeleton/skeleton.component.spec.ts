import { render, screen } from "@testing-library/angular";
import { axe } from "jest-axe";
import { SkeletonComponent } from "./skeleton.component";

// Component-level axe runs: the host is not inside a landmark, which is fine
// for an isolated component, so the page-level "region" rule is disabled.
const axeOptions = { rules: { region: { enabled: false } } };

describe("SkeletonComponent", () => {
  it("renders with aria-hidden to hide from assistive technology", async () => {
    const { container } = await render(`<ui-skeleton />`, {
      imports: [SkeletonComponent],
    });
    const host = container.querySelector("ui-skeleton");
    expect(host).toHaveAttribute("aria-hidden", "true");
  });

  it("applies text variant by default", async () => {
    const { container } = await render(`<ui-skeleton />`, {
      imports: [SkeletonComponent],
    });
    const host = container.querySelector("ui-skeleton");
    expect(host).toHaveClass("ui-skeleton--text");
  });

  it("applies circle variant when specified", async () => {
    const { container } = await render(`<ui-skeleton variant="circle" />`, {
      imports: [SkeletonComponent],
    });
    const host = container.querySelector("ui-skeleton");
    expect(host).toHaveClass("ui-skeleton--circle");
  });

  it("applies rect variant when specified", async () => {
    const { container } = await render(`<ui-skeleton variant="rect" />`, {
      imports: [SkeletonComponent],
    });
    const host = container.querySelector("ui-skeleton");
    expect(host).toHaveClass("ui-skeleton--rect");
  });

  it("renders one line by default for text variant", async () => {
    await render(`<ui-skeleton />`, { imports: [SkeletonComponent] });
    const lines = document.querySelectorAll(".ui-skeleton__line");
    expect(lines).toHaveLength(1);
  });

  it("renders multiple lines when lines input is set", async () => {
    await render(`<ui-skeleton [lines]="3" />`, {
      imports: [SkeletonComponent],
    });
    const lines = document.querySelectorAll(".ui-skeleton__line");
    expect(lines).toHaveLength(3);
  });

  it("has no axe violations (text variant, 1 line)", async () => {
    const { container } = await render(`<ui-skeleton />`, {
      imports: [SkeletonComponent],
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (text variant, 3 lines)", async () => {
    const { container } = await render(`<ui-skeleton [lines]="3" />`, {
      imports: [SkeletonComponent],
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (circle variant)", async () => {
    const { container } = await render(`<ui-skeleton variant="circle" />`, {
      imports: [SkeletonComponent],
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (rect variant)", async () => {
    const { container } = await render(`<ui-skeleton variant="rect" />`, {
      imports: [SkeletonComponent],
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("exposes lineRange computed for template iteration", async () => {
    // lineRange drives @for in the template — verifying DOM output is sufficient
    await render(`<ui-skeleton [lines]="2" />`, {
      imports: [SkeletonComponent],
    });
    const lines = document.querySelectorAll(".ui-skeleton__line");
    expect(lines).toHaveLength(2);
  });
});
