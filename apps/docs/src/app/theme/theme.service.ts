import { Injectable, signal } from "@angular/core";

export type Preset = "default" | "acme";
const PRESET_CLASS: Record<Preset, string> = {
  default: "",
  acme: "ui-theme-acme",
};

@Injectable({ providedIn: "root" })
export class ThemeService {
  readonly dark = signal(localStorage.getItem("onyx-dark") === "true");
  readonly preset = signal<Preset>(
    (localStorage.getItem("onyx-preset") as Preset) || "default",
  );

  constructor() {
    this.setDark(this.dark());
    this.setPreset(this.preset());
  }

  setDark(value: boolean): void {
    this.dark.set(value);
    document.documentElement.classList.toggle("app-dark", value);
    localStorage.setItem("onyx-dark", String(value));
  }

  setPreset(value: Preset): void {
    const root = document.documentElement;
    Object.values(PRESET_CLASS).forEach((c) => c && root.classList.remove(c));
    if (PRESET_CLASS[value]) root.classList.add(PRESET_CLASS[value]);
    this.preset.set(value);
    localStorage.setItem("onyx-preset", value);
  }
}
