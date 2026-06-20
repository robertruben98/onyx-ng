import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";

export type EmptyStateRole = "region" | "status";

let nextId = 0;

/**
 * Placeholder for empty and zero-data views.
 *
 * The title and description slots label the host region. Action slots become
 * native buttons so keyboard behavior and disabled semantics remain built in.
 */
@Component({
  selector: "onyx-empty-state",
  standalone: true,
  templateUrl: "./empty-state.component.html",
  styleUrl: "./empty-state.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: "onyxEmptyState",
  host: {
    "[attr.role]": "role()",
    "[attr.aria-label]": "ariaLabel() || null",
    "[attr.aria-labelledby]": "labelledBy()",
    "[attr.aria-describedby]": "descriptionId",
    "[attr.aria-atomic]": "role() === 'status' ? 'true' : null",
    "[attr.aria-disabled]": "disabled() ? 'true' : null",
    "[class.ui-empty-state]": "true",
    "[class.ui-empty-state--disabled]": "disabled()",
  },
})
export class OnyxEmptyStateComponent {
  /** ARIA role used by the host. Use `status` when an update should be announced. */
  readonly role = input<EmptyStateRole>("region");

  /** Accessible name used instead of the title slot when provided. */
  readonly ariaLabel = input("");

  /** Disables both action buttons and exposes `aria-disabled` on the host. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Emitted when the primary action is activated. */
  readonly primaryAction = output<MouseEvent>();

  /** Emitted when the secondary action is activated. */
  readonly secondaryAction = output<MouseEvent>();

  /** Stable ids connect projected copy with the host's accessible description. */
  protected readonly titleId = `ui-empty-state-title-${nextId}`;
  protected readonly descriptionId = `ui-empty-state-description-${nextId++}`;

  protected readonly labelledBy = computed(() =>
    this.ariaLabel() ? null : this.titleId,
  );

  protected readonly hasPrimaryAction = signal(false);
  protected readonly hasSecondaryAction = signal(false);

  private readonly primaryButton =
    viewChild.required<ElementRef<HTMLButtonElement>>("primaryButton");
  private readonly secondaryButton =
    viewChild.required<ElementRef<HTMLButtonElement>>("secondaryButton");

  constructor() {
    afterNextRender(() => {
      this.hasPrimaryAction.set(
        this.primaryButton().nativeElement.childElementCount > 0,
      );
      this.hasSecondaryAction.set(
        this.secondaryButton().nativeElement.childElementCount > 0,
      );
    });
  }

  protected handlePrimaryAction(event: MouseEvent): void {
    this.primaryAction.emit(event);
  }

  protected handleSecondaryAction(event: MouseEvent): void {
    this.secondaryAction.emit(event);
  }
}
