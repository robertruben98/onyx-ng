import { setupZoneTestEnv } from "jest-preset-angular/setup-env/zone";
import { toHaveNoViolations } from "jest-axe";
import "@testing-library/jest-dom";
import {
  JsdomWindow,
  installJsdomCssLayerFilter,
} from "./libs/ui/test-utils/jsdom-css-layer";

setupZoneTestEnv();
expect.extend(toHaveNoViolations);
// NOISE-1: drop jsdom's "Could not parse CSS stylesheet" for CDK's `@layer`
// overlay styles only; see libs/ui/test-utils/jsdom-css-layer.ts.
installJsdomCssLayerFilter(window as JsdomWindow);
