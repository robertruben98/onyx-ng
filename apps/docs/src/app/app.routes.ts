import { Routes } from "@angular/router";
import { ComponentPageComponent } from "./pages/component-page.component";
import { HomeComponent } from "./pages/home.component";
import { InstallationComponent } from "./pages/installation.component";
import { ThemingComponent } from "./pages/theming.component";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "introduction" },
  { path: "introduction", component: HomeComponent },
  { path: "installation", component: InstallationComponent },
  { path: "theming", component: ThemingComponent },
  { path: "components/:id", component: ComponentPageComponent },
  { path: "**", redirectTo: "introduction" },
];
