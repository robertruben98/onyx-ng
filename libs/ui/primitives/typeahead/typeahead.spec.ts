import { Injector, signal } from "@angular/core";
import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { UiTypeahead, UiTypeaheadItem, createTypeahead } from "./typeahead";

const ITEMS: UiTypeaheadItem[] = [
  { label: "Angular" },
  { label: "React" },
  { label: "Redux", disabled: true },
  { label: "RxJS" },
  { label: "Svelte" },
];

const key = (k: string, init: KeyboardEventInit = {}) =>
  new KeyboardEvent("keydown", { key: k, ...init });

describe("createTypeahead", () => {
  let items: ReturnType<typeof signal<UiTypeaheadItem[]>>;
  let onMatch: jest.Mock;
  let typeahead: UiTypeahead;

  beforeEach(() => {
    items = signal<UiTypeaheadItem[]>(ITEMS);
    onMatch = jest.fn();
    typeahead = TestBed.runInInjectionContext(() =>
      createTypeahead(items, onMatch),
    );
  });

  afterEach(() => typeahead.destroy());

  it("jumps to the first item whose label starts with the letter, after the debounce", fakeAsync(() => {
    typeahead.handleKey(key("r"));
    tick(199);
    expect(onMatch).not.toHaveBeenCalled();
    tick(1);
    expect(onMatch).toHaveBeenCalledWith(1);
  }));

  it("searches from the item after the active one and skips disabled items", fakeAsync(() => {
    typeahead.setActive(1);
    typeahead.handleKey(key("R"));
    tick(200);
    expect(onMatch).toHaveBeenCalledWith(3);
  }));

  it("buffers several letters into one search and wraps around", fakeAsync(() => {
    typeahead.setActive(3);
    typeahead.handleKey(key("a"));
    typeahead.handleKey(key("n"));
    tick(200);
    expect(onMatch).toHaveBeenCalledTimes(1);
    expect(onMatch).toHaveBeenCalledWith(0);
  }));

  it("reports typing only while letters are buffered", fakeAsync(() => {
    expect(typeahead.isTyping()).toBe(false);
    typeahead.handleKey(key("s"));
    expect(typeahead.isTyping()).toBe(true);
    tick(200);
    expect(typeahead.isTyping()).toBe(false);
    expect(onMatch).toHaveBeenCalledWith(4);
  }));

  it("ignores Space, modifier chords and non-printable keys", fakeAsync(() => {
    typeahead.handleKey(key(" "));
    typeahead.handleKey(key("r", { ctrlKey: true }));
    typeahead.handleKey(key("r", { metaKey: true }));
    typeahead.handleKey(key("ArrowDown"));
    typeahead.handleKey(key("Shift"));
    expect(typeahead.isTyping()).toBe(false);
    tick(200);
    expect(onMatch).not.toHaveBeenCalled();
  }));

  it("stays quiet when nothing matches", fakeAsync(() => {
    typeahead.handleKey(key("q"));
    tick(200);
    expect(onMatch).not.toHaveBeenCalled();
  }));

  it("follows the items signal", fakeAsync(() => {
    items.set([{ label: "Zig" }, { label: "Zed" }]);
    TestBed.flushEffects();
    typeahead.handleKey(key("z"));
    tick(200);
    expect(onMatch).toHaveBeenCalledWith(0);
  }));

  it("honours a custom debounce and an explicit injector", fakeAsync(() => {
    const fast = createTypeahead(items, onMatch, {
      debounce: 50,
      injector: TestBed.inject(Injector),
    });
    fast.handleKey(key("s"));
    tick(50);
    expect(onMatch).toHaveBeenCalledWith(4);
    fast.destroy();
  }));
});
