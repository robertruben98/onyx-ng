import {
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  inject,
  input,
  signal,
} from "@angular/core";
import { ComponentPortal } from "@angular/cdk/portal";
import type { OverlayRef } from "@angular/cdk/overlay";
import { UiOverlay, UiOverlayPlacement } from "@onyx/ui/primitives";
import { PopoverComponent } from "./popover.component";

/**
 * Toggles a popover anchored to its host on click. Dismisses on outside click
 * or Escape and restores focus to the trigger. Positioning and focus trap are
 * delegated to the overlay primitive (CDK).
 */
@Directive({
  selector: "[onyxPopover]",
  standalone: true,
  exportAs: "onyxPopover",
  host: {
    "(click)": "toggle()",
    "aria-haspopup": "dialog",
    "[attr.aria-expanded]": "open()",
  },
})
export class PopoverDirective {
  private readonly overlay = inject(UiOverlay);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  /** Content template rendered inside the popover. */
  readonly content = input.required<TemplateRef<unknown>>({
    alias: "onyxPopover",
  });
  /** Preferred placement. */
  readonly placement = input<UiOverlayPlacement>("bottom", {
    alias: "onyxPopoverPlacement",
  });
  /** Accessible label for the popover. */
  readonly label = input("", { alias: "onyxPopoverLabel" });

  /** Whether the popover is currently open. */
  readonly open = signal(false);

  private overlayRef?: OverlayRef;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.close());
  }

  protected toggle(): void {
    if (this.open()) {
      this.close();
    } else {
      this.show();
    }
  }

  private show(): void {
    if (this.overlayRef) return;
    const ref = this.overlay.createConnected(this.elementRef, {
      placement: this.placement(),
      align: "start",
      hasBackdrop: true,
      panelClass: "ui-popover__pane",
    });
    this.overlayRef = ref;
    const instance = ref.attach(new ComponentPortal(PopoverComponent)).instance;
    instance.content.set(this.content());
    instance.label.set(this.label());

    ref.backdropClick().subscribe(() => this.close());
    ref.keydownEvents().subscribe((event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        this.close();
      }
    });
    this.open.set(true);
  }

  /** Public so consumers can close programmatically. */
  close(): void {
    if (!this.overlayRef) return;
    this.overlayRef.dispose();
    this.overlayRef = undefined;
    this.open.set(false);
  }
}
