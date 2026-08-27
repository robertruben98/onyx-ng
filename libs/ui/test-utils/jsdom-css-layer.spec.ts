import { EventEmitter } from "events";
import {
  JsdomWindow,
  installJsdomCssLayerFilter,
  isUnsupportedLayerStylesheetError,
} from "./jsdom-css-layer";

const cssError = (detail: unknown, type: unknown = "css parsing") =>
  Object.assign(new Error("Could not parse CSS stylesheet"), { type, detail });

describe("isUnsupportedLayerStylesheetError", () => {
  it.each([
    [
      "a css parsing error over a sheet using @layer",
      cssError("@layer cdk-overlay{.a{top:0}}"),
      true,
    ],
    [
      "false for a css parsing error over any other sheet",
      cssError("}"),
      false,
    ],
    [
      "false for a css parsing error without the sheet text",
      cssError(undefined),
      false,
    ],
    [
      "another jsdom error type over an @layer sheet",
      cssError("@layer x{}", "unhandled exception"),
      false,
    ],
    ["false for a plain Error", new Error("boom"), false],
    ["false for a string", "nope", false],
    ["false for null", null, false],
  ] as [string, unknown, boolean][])("is %s", (_label, error, expected) => {
    expect(isUnsupportedLayerStylesheetError(error)).toBe(expected);
  });
});

describe("installJsdomCssLayerFilter", () => {
  it("drops only the @layer parse error and forwards everything else to the original listeners", () => {
    const emitter = new EventEmitter();
    const original = jest.fn();
    emitter.on("jsdomError", original);
    const win = { _virtualConsole: emitter } as unknown as JsdomWindow;

    expect(installJsdomCssLayerFilter(win)).toBe(true);

    emitter.emit("jsdomError", cssError("@layer cdk-overlay{}"));
    expect(original).not.toHaveBeenCalled();

    const other = cssError("}");
    const plain = new Error("boom");
    emitter.emit("jsdomError", other);
    emitter.emit("jsdomError", plain);
    expect(original.mock.calls).toEqual([[other], [plain]]);
  });

  it("is a no-op without a VirtualConsole", () => {
    expect(installJsdomCssLayerFilter({} as JsdomWindow)).toBe(false);
  });
});

describe("the jest environment, as wired by setup-jest.ts", () => {
  let consoleError: jest.SpyInstance;
  const styles: HTMLStyleElement[] = [];
  const addStyle = (css: string) => {
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
    styles.push(el);
  };

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
    styles.splice(0).forEach((el) => el.remove());
  });

  it("stays silent for a stylesheet jsdom rejects only because of @layer", () => {
    addStyle("@layer probe { .probe { color: red; } }");
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("still reports other stylesheets jsdom cannot parse", () => {
    addStyle("}");
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError.mock.calls[0][0]).toMatchObject({
      message: "Could not parse CSS stylesheet",
      type: "css parsing",
    });
  });
});
