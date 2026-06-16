import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  signal,
} from "@angular/core";

let nextTabId = 0;

/**
 * A single tab. Declares its trigger `label` and projects the panel content.
 * Rendered and coordinated by the parent `ui-tabs`.
 */
@Component({
  selector: "ui-tab",
  standalone: true,
  template: `
    <div
      role="tabpanel"
      [id]="panelId"
      [attr.aria-labelledby]="tabId"
      [hidden]="!active()"
    >
      <ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
  /** Trigger label shown in the tab list. */
  readonly label = input.required<string>();
  /** Whether this tab is disabled. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Whether this tab's panel is currently shown (set by the parent). */
  readonly active = signal(false);

  private readonly uid = nextTabId++;
  readonly tabId = `ui-tab-${this.uid}`;
  readonly panelId = `ui-tabpanel-${this.uid}`;
}
