import type { VirtualConsole } from "jsdom";

/** The extra fields jsdom puts on the error it emits from `createStylesheet`. */
interface JsdomStylesheetError {
  type?: unknown;
  detail?: unknown;
}

/** A jsdom window: jest-environment-jsdom leaves its VirtualConsole on it. */
export type JsdomWindow = Window & { _virtualConsole?: VirtualConsole };

/**
 * True for the one jsdom error these specs cannot act on: a stylesheet that
 * failed to parse only because it uses `@layer`, which cssom 0.5 (the parser
 * inside jsdom 20) does not know. CDK 19 wraps its overlay structural styles
 * in `@layer cdk-overlay {}` and injects them on the first `Overlay.create()`,
 * so every spec that opened a dialog, menu, select, popover or tooltip printed
 * a twenty-line "Could not parse CSS stylesheet" trace — 46 per full run, not
 * one of them a failure (card NOISE-1). jsdom builds no CSSOM for that sheet
 * either way; nothing here reads it. The real fix is jsdom >= 22 (rrweb-cssom
 * parses `@layer`), which is a dependency bump sequenced separately.
 */
export function isUnsupportedLayerStylesheetError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const { type, detail } = error as JsdomStylesheetError;
  return (
    type === "css parsing" &&
    typeof detail === "string" &&
    /@layer\b/.test(detail)
  );
}

/**
 * Wraps jest-environment-jsdom's `jsdomError` listener so that exactly the
 * error above is dropped. Every other jsdom error — unhandled exceptions,
 * resource failures, any other CSS the parser rejects — still reaches
 * `console.error` through the original listener, unchanged. Returns false when
 * there is no VirtualConsole to wrap (not running under jsdom).
 */
export function installJsdomCssLayerFilter(win: JsdomWindow): boolean {
  const virtualConsole = win._virtualConsole;
  if (!virtualConsole) return false;
  const forward = virtualConsole.listeners("jsdomError") as ((
    error: Error,
  ) => void)[];
  virtualConsole.removeAllListeners("jsdomError");
  virtualConsole.on("jsdomError", (error: Error) => {
    if (isUnsupportedLayerStylesheetError(error)) return;
    forward.forEach((listener) => listener(error));
  });
  return true;
}
