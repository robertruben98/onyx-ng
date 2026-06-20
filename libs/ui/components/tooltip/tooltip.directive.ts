import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
} from "@angular/core";
import { ComponentPortal } from "@angular/cdk/portal";
import type { OverlayRef } from "@angular/cdk/overlay";
import { UiOverlay, UiOverlayPlacement } from "@onyx/ui/primitives";
import { TooltipComponent } from "./tooltip.component";

let nextTooltipId = 0;

/**
 * Attaches a tooltip to its host. Shows on hover/focus, hides on
 * leave/blur/Escape. Wires `aria-describedby` to the floating tooltip.
 * Positioning is delegated to the overlay primitive (CDK).
 */
@Directive({
  selector: "[onyxTooltip]",
  standalone: true,
  host: {
    "(mouseenter)": "show()",
    "(mouseleave)": "hide()",
    "(focus)": "show()",
    "(blur)": "hide()",
    "(keydown.escape)": "hide()",
  },
})
export class TooltipDirective {
  private readonly overlay = inject(UiOverlay);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  /** Tooltip text. */
  readonly text = input.required<string>({ alias: "onyxTooltip" });
  /** Preferred placement. */
  readonly placement = input<UiOverlayPlacement>("top", {
    alias: "onyxTooltipPlacement",
  });

  private overlayRef?: OverlayRef;
  private readonly id = `ui-tooltip-${nextTooltipId++}`;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.hide());
  }

  protected show(): void {
    if (this.overlayRef || !this.text()) return;
    const ref = this.overlay.createConnected(this.elementRef, {
      placement: this.placement(),
      align: "center",
      panelClass: "ui-tooltip__pane",
    });
    this.overlayRef = ref;
    const instance = ref.attach(new ComponentPortal(TooltipComponent)).instance;
    instance.id.set(this.id);
    instance.text.set(this.text());
    this.elementRef.nativeElement.setAttribute("aria-describedby", this.id);
  }

  protected hide(): void {
    if (!this.overlayRef) return;
    this.overlayRef.dispose();
    this.overlayRef = undefined;
    this.elementRef.nativeElement.removeAttribute("aria-describedby");
  }
}
