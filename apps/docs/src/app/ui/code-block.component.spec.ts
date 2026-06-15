import { render, screen, fireEvent } from "@testing-library/angular";
import { CodeBlockComponent } from "./code-block.component";

describe("CodeBlockComponent", () => {
  it("shows the code and copies it to the clipboard", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    await render(CodeBlockComponent, {
      componentInputs: { code: "<ui-button>Hi</ui-button>" },
    });
    expect(screen.getByText("<ui-button>Hi</ui-button>")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /copy/i }));
    await new Promise((r) => setTimeout(r, 0));
    expect(writeText).toHaveBeenCalledWith("<ui-button>Hi</ui-button>");
  });
});
