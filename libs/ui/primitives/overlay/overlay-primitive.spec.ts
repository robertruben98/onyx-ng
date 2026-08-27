import { ElementRef } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { Subject } from "rxjs";
import {
  UiOverlay,
  UiOverlayAlign,
  UiOverlayPlacement,
} from "./overlay-primitive";

describe("UiOverlay", () => {
  const overlayRef = { id: "overlay-ref" };
  let positions: unknown[];
  let createdConfig: OverlayConfig;
  let connectedOrigin: unknown;
  let service: UiOverlay;

  beforeEach(() => {
    positions = [];

    const globalStrategy = {
      centerHorizontally: jest.fn().mockReturnThis(),
      centerVertically: jest.fn().mockReturnThis(),
    };
    const connectedStrategy: {
      withPositions: jest.Mock;
      withPush: jest.Mock;
      withFlexibleDimensions: jest.Mock;
    } = {
      withPositions: jest.fn((value: unknown[]) => {
        positions = value;
        return connectedStrategy;
      }),
      withPush: jest.fn().mockReturnThis(),
      withFlexibleDimensions: jest.fn().mockReturnThis(),
    };
    const overlay = {
      create: jest.fn((config: OverlayConfig) => {
        createdConfig = config;
        return overlayRef;
      }),
      scrollStrategies: {
        block: jest.fn(() => "block"),
        reposition: jest.fn(() => "reposition"),
      },
      position: jest.fn(() => ({
        global: jest.fn(() => globalStrategy),
        flexibleConnectedTo: jest.fn((origin) => {
          connectedOrigin = origin;
          return connectedStrategy;
        }),
      })),
    };

    TestBed.configureTestingModule({
      providers: [UiOverlay, { provide: Overlay, useValue: overlay }],
    });
    service = TestBed.inject(UiOverlay);
  });

  it("creates a modal with safe defaults", () => {
    expect(service.create()).toBe(overlayRef);
    expect(createdConfig).toEqual(
      expect.objectContaining({
        hasBackdrop: true,
        backdropClass: "onyx-overlay-backdrop",
        panelClass: "",
        scrollStrategy: "block",
      }),
    );
  });

  it("forwards custom modal options", () => {
    service.create({
      hasBackdrop: false,
      backdropClass: "custom-backdrop",
      panelClass: ["one", "two"],
    });

    expect(createdConfig).toEqual(
      expect.objectContaining({
        hasBackdrop: false,
        backdropClass: "custom-backdrop",
        panelClass: ["one", "two"],
      }),
    );
  });

  it("accepts ElementRef origins and connected-overlay defaults", () => {
    const origin = new ElementRef(document.createElement("button"));
    expect(service.createConnected(origin)).toBe(overlayRef);
    expect(connectedOrigin).toBe(origin);
    expect(createdConfig).toEqual(
      expect.objectContaining({
        hasBackdrop: false,
        backdropClass: "cdk-overlay-transparent-backdrop",
        panelClass: "",
        scrollStrategy: "reposition",
      }),
    );
    expect(positions).toEqual([
      expect.objectContaining({ originY: "bottom", offsetY: 8 }),
      expect.objectContaining({ originY: "top", offsetY: -8 }),
    ]);
  });

  it("forwards custom connected-overlay options", () => {
    service.createConnected(document.createElement("button"), {
      placement: "top",
      align: "center",
      offset: 0,
      hasBackdrop: true,
      backdropClass: "custom-backdrop",
      panelClass: "custom-panel",
    });

    expect(createdConfig).toEqual(
      expect.objectContaining({
        hasBackdrop: true,
        backdropClass: "custom-backdrop",
        panelClass: "custom-panel",
      }),
    );
    expect(positions).toEqual([
      expect.objectContaining({
        originX: "center",
        originY: "top",
        offsetY: -0,
      }),
      expect.objectContaining({
        originX: "center",
        originY: "bottom",
        offsetY: 0,
      }),
    ]);
  });

  describe("outsideClicks", () => {
    let events: Subject<MouseEvent>;
    let ref: OverlayRef;
    let origin: HTMLButtonElement;
    let elsewhere: HTMLDivElement;

    beforeEach(() => {
      events = new Subject<MouseEvent>();
      ref = { outsidePointerEvents: () => events } as unknown as OverlayRef;
      origin = document.createElement("button");
      origin.innerHTML = "<span>label</span>";
      elsewhere = document.createElement("div");
      document.body.append(origin, elsewhere);
    });

    afterEach(() => {
      origin.remove();
      elsewhere.remove();
    });

    const clickOn = (target: EventTarget) => {
      const event = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(event, "target", { value: target });
      events.next(event);
    };

    it("passes pointer events that land outside both the pane and the origin", () => {
      const seen = jest.fn();
      service.outsideClicks(ref, origin).subscribe(seen);

      clickOn(elsewhere);
      clickOn(document.body);

      expect(seen).toHaveBeenCalledTimes(2);
    });

    it("ignores events on the origin or its descendants, so a trigger toggles once", () => {
      const seen = jest.fn();
      service.outsideClicks(ref, new ElementRef(origin)).subscribe(seen);

      clickOn(origin);
      clickOn(origin.firstElementChild as HTMLElement);
      clickOn(elsewhere);

      expect(seen).toHaveBeenCalledTimes(1);
    });

    it("treats a non-node target as outside", () => {
      const seen = jest.fn();
      service.outsideClicks(ref, origin).subscribe(seen);

      clickOn(window);

      expect(seen).toHaveBeenCalledTimes(1);
    });
  });

  it.each([
    ["bottom", "end", { originX: "end", originY: "bottom", offsetY: 6 }],
    ["left", "start", { originX: "start", originY: "top", offsetX: -6 }],
    ["right", "end", { originX: "end", originY: "bottom", offsetX: 6 }],
  ] satisfies [
    UiOverlayPlacement,
    UiOverlayAlign,
    Record<string, string | number>,
  ][])(
    "builds %s/%s positions with an opposite-side fallback",
    (placement, align, expected) => {
      service.createConnected(document.createElement("button"), {
        placement,
        align,
        offset: 6,
      });

      expect(positions).toHaveLength(2);
      expect(positions[0]).toEqual(expect.objectContaining(expected));
    },
  );
});
