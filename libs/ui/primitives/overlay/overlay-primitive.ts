import { ElementRef, Injectable, inject } from "@angular/core";
import {
  ConnectedPosition,
  Overlay,
  OverlayConfig,
  OverlayRef,
} from "@angular/cdk/overlay";

/** Options for a centered modal overlay. */
export interface UiOverlayConfig {
  /** Whether a backdrop is rendered (enables outside-click dismissal). */
  hasBackdrop?: boolean;
  /** Class applied to the backdrop element. */
  backdropClass?: string;
  /** Class(es) applied to the overlay pane. */
  panelClass?: string | string[];
}

/** Side a connected overlay prefers relative to its origin. */
export type UiOverlayPlacement = "top" | "bottom" | "left" | "right";
/** Alignment along the cross axis of the placement. */
export type UiOverlayAlign = "start" | "center" | "end";

/** Options for an overlay anchored to a trigger element. */
export interface UiConnectedOverlayConfig {
  /** Preferred side. A fallback on the opposite side is added automatically. */
  placement?: UiOverlayPlacement;
  /** Cross-axis alignment. */
  align?: UiOverlayAlign;
  /** Gap between trigger and overlay, in pixels. */
  offset?: number;
  /** Whether a (transparent, by default) backdrop is rendered. */
  hasBackdrop?: boolean;
  /** Class applied to the backdrop element. */
  backdropClass?: string;
  /** Class(es) applied to the overlay pane. */
  panelClass?: string | string[];
}

/**
 * Behaviour primitive wrapping `@angular/cdk/overlay`. Components never reach
 * into CDK directly (CLAUDE.md §2/§9): they ask here for a configured
 * `OverlayRef` — modal (`create`) or anchored (`createConnected`) — and drive
 * it through CDK's own API (`attach`, `backdropClick`, `keydownEvents`,
 * `dispose`).
 */
@Injectable({ providedIn: "root" })
export class UiOverlay {
  private readonly overlay = inject(Overlay);

  /** Create a centered, scroll-blocking modal overlay backed by CDK. */
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

  /** Create an overlay anchored to `origin`, repositioning on scroll. */
  createConnected(
    origin: ElementRef | HTMLElement,
    config: UiConnectedOverlayConfig = {},
  ): OverlayRef {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions(
        this.positionsFor(
          config.placement ?? "bottom",
          config.align ?? "start",
          config.offset ?? 8,
        ),
      )
      .withPush(true)
      .withFlexibleDimensions(false);

    return this.overlay.create(
      new OverlayConfig({
        hasBackdrop: config.hasBackdrop ?? false,
        backdropClass:
          config.backdropClass ?? "cdk-overlay-transparent-backdrop",
        panelClass: config.panelClass,
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
        positionStrategy,
      }),
    );
  }

  /** Primary position for `placement`/`align` plus an opposite-side fallback. */
  private positionsFor(
    placement: UiOverlayPlacement,
    align: UiOverlayAlign,
    offset: number,
  ): ConnectedPosition[] {
    const x = { start: "start", center: "center", end: "end" } as const;
    const y = { start: "top", center: "center", end: "bottom" } as const;

    if (placement === "top" || placement === "bottom") {
      const top: ConnectedPosition = {
        originX: x[align],
        originY: "top",
        overlayX: x[align],
        overlayY: "bottom",
        offsetY: -offset,
      };
      const bottom: ConnectedPosition = {
        originX: x[align],
        originY: "bottom",
        overlayX: x[align],
        overlayY: "top",
        offsetY: offset,
      };
      return placement === "top" ? [top, bottom] : [bottom, top];
    }

    const left: ConnectedPosition = {
      originX: "start",
      originY: y[align],
      overlayX: "end",
      overlayY: y[align],
      offsetX: -offset,
    };
    const right: ConnectedPosition = {
      originX: "end",
      originY: y[align],
      overlayX: "start",
      overlayY: y[align],
      offsetX: offset,
    };
    return placement === "left" ? [left, right] : [right, left];
  }
}
