import { TestBed } from "@angular/core/testing";
import { ThemeService } from "./theme.service";

describe("ThemeService", () => {
  let svc: ThemeService;
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    TestBed.configureTestingModule({});
    svc = TestBed.inject(ThemeService);
  });

  it("toggles the dark class on the document root", () => {
    expect(document.documentElement.classList.contains("app-dark")).toBe(false);
    svc.setDark(true);
    expect(document.documentElement.classList.contains("app-dark")).toBe(true);
    svc.setDark(false);
    expect(document.documentElement.classList.contains("app-dark")).toBe(false);
  });

  it("applies a preset class and removes the previous one", () => {
    svc.setPreset("acme");
    expect(document.documentElement.classList.contains("ui-theme-acme")).toBe(
      true,
    );
    svc.setPreset("default");
    expect(document.documentElement.classList.contains("ui-theme-acme")).toBe(
      false,
    );
  });

  it("persists choices to localStorage", () => {
    svc.setDark(true);
    svc.setPreset("acme");
    expect(localStorage.getItem("onyx-dark")).toBe("true");
    expect(localStorage.getItem("onyx-preset")).toBe("acme");
  });
});
