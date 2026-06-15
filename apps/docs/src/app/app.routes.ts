import { Routes } from "@angular/router";
import { COMPONENT_DOCS } from "./registry";
import { ComponentPageComponent } from "./pages/component-page.component";

const first = COMPONENT_DOCS[0]?.id ?? "";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: `components/${first}` },
  { path: "components/:id", component: ComponentPageComponent },
  { path: "**", redirectTo: `components/${first}` },
];
