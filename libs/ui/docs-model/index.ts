import { Type } from "@angular/core";

/** One row in a component's API table (input or output). */
export interface ApiRow {
  /** Property name. Outputs are written as '(name)'. */
  name: string;
  /** Type as displayed, e.g. "'primary' | 'secondary'". */
  type: string;
  /** Default value, or '-' for outputs/required. */
  default: string;
  /** Short description. */
  description: string;
}

/** A single live example. The component's template IS the shown code. */
export interface Demo {
  title: string;
  description?: string;
  /** Source shown in the code panel; also the demo component's template. */
  code: string;
  /** Standalone component rendered live via NgComponentOutlet. */
  component: Type<unknown>;
}

/** Everything needed to render one component's documentation page. */
export interface ComponentDoc {
  /** Route segment, e.g. 'button'. */
  id: string;
  /** Display name, e.g. 'Button'. */
  title: string;
  /** Prose description (1–3 sentences). */
  description: string;
  api: ApiRow[];
  demos: Demo[];
}
