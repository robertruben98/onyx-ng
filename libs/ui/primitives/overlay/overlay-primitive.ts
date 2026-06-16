import { Injectable, inject } from "@angular/core";
import { Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";

/** Options for opening a modal overlay. All behaviour is delegated to CDK. */
export interface UiOverlayConfig {
  /** Whether a backdrop is rendered (enables outside-click dismissal). */
  hasBackdrop?: boolean;
  /** Class applied to the backdrop element. */
  backdropClass?: string;
  /** Class(es) applied to the overlay pane. */
  panelClass?: string | string[];
}

/**
 * Behaviour primitive that wraps `@angular/cdk/overlay`. Components never reach
 * into CDK directly (CLAUDE.md §2/§9): they ask this primitive for a centered,
 * scroll-blocking, modal `OverlayRef` and drive it through CDK's own API
 * (`attach`, `backdropClick`, `keydownEvents`, `dispose`).
 */
@Injectable({ providedIn: "root" })
export class UiOverlay {
  private readonly overlay = inject(Overlay);

  /** Create a centered modal overlay backed by Angular CDK. */
  create(config: UiOverlayConfig = {}): OverlayRef {
    return this.overlay.create(
      new OverlayConfig({
        hasBackdrop: config.hasBackdrop ?? true,
        backdropClass: config.backdropClass ?? "cdk-overlay-dark-backdrop",
        panelClass: config.panelClass,
        scrollStrategy: this.overlay.scrollStrategies.block(),
        positionStrategy: this.overlay
          .position()
          .global()
          .centerHorizontally()
          .centerVertically(),
      }),
    );
  }
}
