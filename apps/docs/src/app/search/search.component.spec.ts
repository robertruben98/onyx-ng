import { render, screen, fireEvent } from "@testing-library/angular";
import { provideRouter } from "@angular/router";
import { SearchComponent } from "./search.component";

async function setup() {
  return render(SearchComponent, {
    providers: [provideRouter([])],
  });
}

describe("SearchComponent", () => {
  it("renders the trigger button", async () => {
    await setup();
    expect(
      screen.getByRole("button", { name: /search documentation/i }),
    ).toBeInTheDocument();
  });

  it("opens the palette when the trigger is clicked", async () => {
    await setup();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /search documentation/i }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // All nav entries are listed before any filtering.
    expect(screen.getByText("Introduction")).toBeInTheDocument();
    expect(screen.getByText("Installation")).toBeInTheDocument();
  });

  it("filters results as the user types", async () => {
    await setup();
    fireEvent.click(
      screen.getByRole("button", { name: /search documentation/i }),
    );
    const input = screen.getByRole("combobox");
    fireEvent.input(input, { target: { value: "install" } });
    expect(screen.getByText("Installation")).toBeInTheDocument();
    expect(screen.queryByText("Introduction")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    await setup();
    fireEvent.click(
      screen.getByRole("button", { name: /search documentation/i }),
    );
    fireEvent.input(screen.getByRole("combobox"), {
      target: { value: "zzzzzzz" },
    });
    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    await setup();
    fireEvent.click(
      screen.getByRole("button", { name: /search documentation/i }),
    );
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens with Cmd/Ctrl+K", async () => {
    await setup();
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
