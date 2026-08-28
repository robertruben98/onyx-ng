import { render, screen } from "@testing-library/angular";
import { provideRouter } from "@angular/router";
import { axe, toHaveNoViolations } from "jest-axe";
import { InstallationComponent } from "./installation.component";

expect.extend(toHaveNoViolations);

/**
 * DOCS-1. The package is published to GitHub Packages, so `npm install
 * @robertruben98/onyx-ui` 404s on npmjs unless the consumer's `.npmrc` routes
 * the scope first. The root README and the package README carry that step;
 * this page -- the one a new consumer actually reads -- did not.
 */
const setup = () =>
  render(InstallationComponent, { providers: [provideRouter([])] });

describe("InstallationComponent", () => {
  it("routes the scope to GitHub Packages before the install command", async () => {
    const { container } = await setup();
    const text = container.textContent ?? "";
    const registry = text.indexOf(
      "@robertruben98:registry=https://npm.pkg.github.com",
    );
    const install = text.indexOf("npm install @robertruben98/onyx-ui");
    expect(registry).toBeGreaterThan(-1);
    expect(install).toBeGreaterThan(-1);
    expect(registry).toBeLessThan(install);
  });

  it("gives the consumer the whole .npmrc, token scope included", async () => {
    const { container } = await setup();
    const text = container.textContent ?? "";
    expect(text).toContain(
      "//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}",
    );
    expect(text).toContain("read:packages");
    // The dotfile must be spelled where the reader will look for it.
    expect(
      screen.getByRole("heading", { level: 2, name: /registry/i }),
    ).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = await setup();
    expect(await axe(container)).toHaveNoViolations();
  }, 30_000);
});
