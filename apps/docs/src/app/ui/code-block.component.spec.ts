import { render, screen, fireEvent } from "@testing-library/angular";
import { CodeBlockComponent } from "./code-block.component";

describe("CodeBlockComponent", () => {
  it("shows the code and copies it to the clipboard", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    const { container } = await render(CodeBlockComponent, {
      componentInputs: { code: "<ui-button>Hi</ui-button>" },
    });
    // Highlighting splits the source across <span> tokens; the rendered
    // textContent must still reconstruct the original code verbatim.
    const codeEl = container.querySelector("code");
    expect(codeEl?.textContent).toBe("<ui-button>Hi</ui-button>");
    fireEvent.click(screen.getByRole("button", { name: /copy/i }));
    await new Promise((r) => setTimeout(r, 0));
    expect(writeText).toHaveBeenCalledWith("<ui-button>Hi</ui-button>");
  });
});
