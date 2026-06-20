import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ButtonComponent } from "@onyx/ui/components";
import { Preset, ThemeService } from "./theme.service";

@Component({
  selector: "docs-theme-controls",
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <onyx-button
      variant="secondary"
      size="sm"
      (clicked)="theme.setDark(!theme.dark())"
    >
      {{ theme.dark() ? "🌙 Dark" : "☀ Light" }}
    </onyx-button>
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
      .docs-theme__preset select {
        cursor: pointer;
        height: 2rem;
        padding: 0 0.6rem;
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
      .docs-theme__preset select:hover {
        border-color: var(--ui-color-primary);
      }
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
      @media (max-width: 480px) {
        .docs-theme__preset select {
          padding: 0 0.4rem;
          font-size: 0.8rem;
        }
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
