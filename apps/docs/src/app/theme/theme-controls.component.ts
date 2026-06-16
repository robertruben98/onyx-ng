import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Preset, ThemeService } from "./theme.service";

@Component({
  selector: "docs-theme-controls",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="docs-theme__toggle"
      [attr.aria-pressed]="theme.dark()"
      (click)="theme.setDark(!theme.dark())"
    >
      {{ theme.dark() ? "🌙 Dark" : "☀ Light" }}
    </button>
    <label class="docs-theme__preset">
      <span class="docs-visually-hidden">Theme preset</span>
      <select [value]="theme.preset()" (change)="onPreset($event)">
        <option value="default">default</option>
        <option value="acme">acme</option>
      </select>
    </label>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        gap: 0.5rem;
        align-items: center;
      }
      .docs-theme__toggle,
      .docs-theme__preset select {
        cursor: pointer;
        padding: 0.4rem 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid var(--ui-color-border);
        background: var(--ui-color-surface);
        color: var(--ui-color-text);
        font: inherit;
        font-size: 0.85rem;
        transition:
          border-color 0.15s ease,
          background-color 0.15s ease;
      }
      .docs-theme__toggle:hover,
      .docs-theme__preset select:hover {
        border-color: var(--ui-color-primary);
      }
      .docs-theme__toggle:focus-visible,
      .docs-theme__preset select:focus-visible {
        outline: 2px solid var(--ui-focus-ring);
        outline-offset: 2px;
      }
      .docs-visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
      }
    `,
  ],
})
export class ThemeControlsComponent {
  protected readonly theme = inject(ThemeService);
  protected onPreset(e: Event): void {
    this.theme.setPreset((e.target as HTMLSelectElement).value as Preset);
  }
}
