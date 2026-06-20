import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  effect,
  inject,
  input,
  model,
  output,
  viewChild,
} from "@angular/core";
import { A11yModule } from "@angular/cdk/a11y";
import { TemplatePortal } from "@angular/cdk/portal";
import type { OverlayRef } from "@angular/cdk/overlay";
import { UiOverlay } from "@onyx/ui/primitives";

export type DialogSize = "sm" | "md" | "lg";

let nextId = 0;

/**
 * Modal dialog. Rendering, backdrop, scroll-blocking and positioning are
 * delegated to the overlay primitive (CDK); focus trap, initial focus and
 * focus restoration are delegated to CDK's `cdkTrapFocus` (autoCapture).
 * Nothing here is hand-rolled (CLAUDE.md §6/§9).
 */
@Component({
  selector: "onyx-dialog",
  standalone: true,
  imports: [A11yModule],
  templateUrl: "./dialog.component.html",
  styleUrl: "./dialog.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  private readonly overlay = inject(UiOverlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  /** Open state. Two-way bindable: closing (Esc/backdrop/button) sets it false. */
  readonly open = model(false);
  /** Heading text; labels the dialog via `aria-labelledby`. */
  readonly heading = input("");
  /** Accessible name used when no `heading` is provided. */
  readonly ariaLabel = input("");
  /** Accessible name for the close button. */
  readonly closeLabel = input("Close");
  /** Whether pressing Esc closes the dialog. */
  readonly closeOnEsc = input(true, { transform: booleanAttribute });
  /** Whether clicking the backdrop closes the dialog. */
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });
  /** Panel size. */
  readonly size = input<DialogSize>("md");

  /** Emitted after the dialog is attached to the overlay. */
  readonly opened = output<void>();
  /** Emitted after the dialog is detached. */
  readonly closed = output<void>();

  /** Stable id wiring the title to `aria-labelledby`. */
  protected readonly headingId = `ui-dialog-title-${nextId++}`;

  private readonly panelTpl = viewChild<TemplateRef<unknown>>("panelTpl");
  private overlayRef?: OverlayRef;

  constructor() {
    effect(() => {
      const shouldOpen = this.open();
      const tpl = this.panelTpl();
      if (shouldOpen && tpl && !this.overlayRef) {
        this.attach(tpl);
      } else if (!shouldOpen && this.overlayRef) {
        this.detach();
      }
    });

    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose());
  }

  /** Close the dialog (button / programmatic). */
  protected close(): void {
    this.open.set(false);
  }

  private attach(tpl: TemplateRef<unknown>): void {
    const ref = this.overlay.create({ panelClass: "ui-dialog__pane" });
    this.overlayRef = ref;
    ref.attach(new TemplatePortal(tpl, this.viewContainerRef));

    ref.backdropClick().subscribe(() => {
      if (this.closeOnBackdrop()) {
        this.close();
      }
    });
    ref.keydownEvents().subscribe((event) => {
      if (event.key === "Escape" && this.closeOnEsc()) {
        event.preventDefault();
        this.close();
      }
    });

    this.opened.emit();
  }

  private detach(): void {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.closed.emit();
  }
}
