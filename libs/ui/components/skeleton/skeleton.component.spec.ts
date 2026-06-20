import { render } from "@testing-library/angular";
import { axe } from "jest-axe";
import { OnyxSkeletonComponent } from "./skeleton.component";

// Component-level axe runs: the host is not inside a landmark, which is fine
// for an isolated component, so the page-level "region" rule is disabled.
const axeOptions = { rules: { region: { enabled: false } } };

describe("OnyxSkeletonComponent", () => {
  it("renders with aria-hidden to hide from assistive technology", async () => {
    const { container } = await render(`<onyx-skeleton />`, {
      imports: [OnyxSkeletonComponent],
    });
    const host = container.querySelector("onyx-skeleton");
    expect(host).toHaveAttribute("aria-hidden", "true");
  });

  it("applies text variant by default", async () => {
    const { container } = await render(`<onyx-skeleton />`, {
      imports: [OnyxSkeletonComponent],
    });
    const host = container.querySelector("onyx-skeleton");
    expect(host).toHaveClass("ui-skeleton--text");
  });

  it("applies circle variant when specified", async () => {
    const { container } = await render(`<onyx-skeleton variant="circle" />`, {
      imports: [OnyxSkeletonComponent],
    });
    const host = container.querySelector("onyx-skeleton");
    expect(host).toHaveClass("ui-skeleton--circle");
  });

  it("applies rect variant when specified", async () => {
    const { container } = await render(`<onyx-skeleton variant="rect" />`, {
      imports: [OnyxSkeletonComponent],
    });
    const host = container.querySelector("onyx-skeleton");
    expect(host).toHaveClass("ui-skeleton--rect");
  });

  it("renders one line by default for text variant", async () => {
    await render(`<onyx-skeleton />`, { imports: [OnyxSkeletonComponent] });
    const lines = document.querySelectorAll(".ui-skeleton__line");
    expect(lines).toHaveLength(1);
  });

  it("renders multiple lines when lines input is set", async () => {
    await render(`<onyx-skeleton [lines]="3" />`, {
      imports: [OnyxSkeletonComponent],
    });
    const lines = document.querySelectorAll(".ui-skeleton__line");
    expect(lines).toHaveLength(3);
  });

  it("has no axe violations (text variant, 1 line)", async () => {
    const { container } = await render(`<onyx-skeleton />`, {
      imports: [OnyxSkeletonComponent],
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (text variant, 3 lines)", async () => {
    const { container } = await render(`<onyx-skeleton [lines]="3" />`, {
      imports: [OnyxSkeletonComponent],
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (circle variant)", async () => {
    const { container } = await render(`<onyx-skeleton variant="circle" />`, {
      imports: [OnyxSkeletonComponent],
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations (rect variant)", async () => {
    const { container } = await render(`<onyx-skeleton variant="rect" />`, {
      imports: [OnyxSkeletonComponent],
    });
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("exposes lineRange computed for template iteration", async () => {
    // lineRange drives @for in the template — verifying DOM output is sufficient
    await render(`<onyx-skeleton [lines]="2" />`, {
      imports: [OnyxSkeletonComponent],
    });
    const lines = document.querySelectorAll(".ui-skeleton__line");
    expect(lines).toHaveLength(2);
  });
});
