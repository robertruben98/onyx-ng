import { render, screen } from "@testing-library/angular";
import { provideRouter } from "@angular/router";
import { AppComponent } from "./app/app.component";
import { routes } from "./app/app.routes";
import { COMPONENT_DOCS } from "./app/registry";

describe("AppComponent", () => {
  it("boots and lists every component in the sidebar", async () => {
    await render(AppComponent, { providers: [provideRouter(routes)] });
    for (const doc of COMPONENT_DOCS) {
      expect(screen.getByRole("link", { name: doc.title })).toBeInTheDocument();
    }
  });
});
