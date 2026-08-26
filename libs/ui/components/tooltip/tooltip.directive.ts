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
import { OnyxTooltipComponent } from "./tooltip.component";

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
export class OnyxTooltipDirective {
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
    const instance = ref.attach(new ComponentPortal(OnyxTooltipComponent)).instance;
    instance.id.set(this.id);
    instance.text.set(this.text());
    this.updateDescribedBy((ids) => [...ids, this.id]);
  }

  protected hide(): void {
    if (!this.overlayRef) return;
    this.overlayRef.dispose();
    this.overlayRef = undefined;
    this.updateDescribedBy((ids) => ids.filter((id) => id !== this.id));
  }

  /**
   * B-11: `aria-describedby` is a space-separated id list the consumer may
   * already use (hints, helper text). Add/remove only the tooltip's own id;
   * drop the attribute only when nothing is left.
   */
  private updateDescribedBy(edit: (ids: string[]) => string[]): void {
    const el: HTMLElement = this.elementRef.nativeElement;
    const current = (el.getAttribute("aria-describedby") ?? "")
      .split(/\s+/)
      .filter((id) => id && id !== this.id);
    const next = edit(current);
    if (next.length) el.setAttribute("aria-describedby", next.join(" "));
    else el.removeAttribute("aria-describedby");
  }
}
