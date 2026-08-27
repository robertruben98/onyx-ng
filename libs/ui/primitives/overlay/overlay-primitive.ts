import { ElementRef, Injectable, inject } from "@angular/core";
import {
  ConnectedPosition,
  Overlay,
  OverlayConfig,
  OverlayRef,
} from "@angular/cdk/overlay";
import { Observable, filter } from "rxjs";

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
  /**
   * Gap between trigger and overlay, in pixels. Defaults to the
   * `--ui-overlay-offset` token as computed on the origin (`{space.2}`,
   * 0.5rem = 8px), so a preset re-skins the gap without touching a component.
   */
  offset?: number;
  /** Whether a (transparent, by default) backdrop is rendered. */
  hasBackdrop?: boolean;
  /** Class applied to the backdrop element. */
  backdropClass?: string;
  /** Class(es) applied to the overlay pane. */
  panelClass?: string | string[];
}

/** Token that carries the trigger-to-pane gap for anchored overlays. */
const OFFSET_TOKEN = "--ui-overlay-offset";
/** Gap used when the token is absent or not a px/rem length (jsdom, no CSS). */
const DEFAULT_OFFSET_PX = 8;
/** Fallback root font size for rem tokens when the browser reports none. */
const DEFAULT_ROOT_FONT_PX = 16;

const elementOf = (origin: ElementRef | HTMLElement): HTMLElement =>
  origin instanceof ElementRef ? origin.nativeElement : origin;

/**
 * Behaviour primitive wrapping `@angular/cdk/overlay`. Components never reach
 * into CDK directly (CLAUDE.md §2/§9): they ask here for a configured
 * `OverlayRef` — modal (`create`) or anchored (`createConnected`) — and drive
 * it through CDK's own API (`attach`, `backdropClick`, `keydownEvents`,
 * `dispose`). Non-modal overlays dismiss through `outsideClicks` instead of a
 * backdrop, so the click that dismisses them still reaches its target.
 */
@Injectable({ providedIn: "root" })
export class UiOverlay {
  private readonly overlay = inject(Overlay);

  /** Create a centered, scroll-blocking modal overlay backed by CDK. */
  create(config: UiOverlayConfig = {}): OverlayRef {
    return this.overlay.create(
      new OverlayConfig({
        hasBackdrop: config.hasBackdrop ?? true,
        backdropClass: config.backdropClass ?? "onyx-overlay-backdrop",
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
          config.offset ?? this.tokenOffsetPx(elementOf(origin)),
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

  /**
   * Pointer events that landed outside `ref`'s pane AND outside `origin`.
   * Subscribe to dismiss a non-modal overlay (menu, select, popover) on an
   * outside click without a backdrop: a transparent backdrop swallows that
   * click, so closing a menu by clicking a link used to take two clicks (W4-6).
   * The origin is excluded because CDK dispatches these from a capturing
   * `click` listener on `body`, i.e. BEFORE the trigger's own handler runs —
   * without the filter a trigger click would close here and re-open in the
   * component's `toggle()` a moment later.
   */
  outsideClicks(
    ref: OverlayRef,
    origin: ElementRef | HTMLElement,
  ): Observable<MouseEvent> {
    const element = elementOf(origin);
    return ref
      .outsidePointerEvents()
      .pipe(
        filter(
          (event) =>
            !(event.target instanceof Node && element.contains(event.target)),
        ),
      );
  }

  /**
   * `--ui-overlay-offset` as computed on `origin`, in pixels. A custom property
   * is NOT resolved to a used value by the engine: `getComputedStyle` returns
   * the substituted token stream, i.e. the literal `0.5rem` — parseFloat alone
   * would silently turn an 8px gap into 0.5px. So px is taken verbatim, rem is
   * multiplied by the root font size, and anything else (missing token, other
   * units, unitless) falls back to the historical 8px.
   */
  private tokenOffsetPx(origin: HTMLElement): number {
    const raw = getComputedStyle(origin).getPropertyValue(OFFSET_TOKEN).trim();
    const match = /^(-?\d*\.?\d+)(px|rem)$/.exec(raw);
    if (!match) return DEFAULT_OFFSET_PX;
    const [, value, unit] = match;
    if (unit === "px") return Number(value);
    const rootPx = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    return (
      Number(value) * (Number.isFinite(rootPx) ? rootPx : DEFAULT_ROOT_FONT_PX)
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
