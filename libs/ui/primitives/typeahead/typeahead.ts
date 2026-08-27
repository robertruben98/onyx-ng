import { Injector, Signal, computed, inject } from "@angular/core";
import { ListKeyManager, ListKeyManagerOption } from "@angular/cdk/a11y";

/** What typeahead needs from an item: its visible label, and whether to skip it. */
export interface UiTypeaheadItem {
  label: string;
  disabled?: boolean;
}

export interface UiTypeaheadOptions {
  /** Milliseconds of silence that end one search. Default 200 (CDK's own). */
  debounce?: number;
  /** Injector for the items effect. Defaults to the current injection context. */
  injector?: Injector;
}

/** Type-to-jump for a list whose focus/active state the component owns. */
export interface UiTypeahead {
  /** Feed a keydown; printable, unmodified keys accumulate into the search. */
  handleKey(event: KeyboardEvent): void;
  /** Where the next search starts — keep it on the component's active item. */
  setActive(index: number): void;
  /** True while typed letters are buffered. */
  isTyping(): boolean;
  destroy(): void;
}

/**
 * Behaviour primitive wrapping CDK `ListKeyManager.withTypeAhead` (CLAUDE.md
 * §2: keyboard behaviour wraps the CDK, it is not reimplemented). Only the
 * type-ahead half is used: menu and select already own arrow/Home/End
 * navigation, so the manager never sees those keys and never moves focus by
 * itself — it just answers "which index did the user type towards" through
 * `onMatch`, searching from the item after the active one, skipping disabled
 * items and wrapping (APG listbox/menu "type-ahead").
 */
export function createTypeahead(
  items: Signal<readonly UiTypeaheadItem[]>,
  onMatch: (index: number) => void,
  options: UiTypeaheadOptions = {},
): UiTypeahead {
  const injector = options.injector ?? inject(Injector);
  const managed = computed<ListKeyManagerOption[]>(() =>
    items().map((item) => ({
      disabled: item.disabled,
      getLabel: () => item.label,
    })),
  );
  const manager = new ListKeyManager(managed, injector).withTypeAhead(
    options.debounce ?? 200,
  );
  const subscription = manager.change.subscribe(onMatch);

  return {
    handleKey(event: KeyboardEvent): void {
      // Space keeps its APG meaning (select/activate) and never joins the
      // search; the manager itself drops modifier chords (Ctrl+R stays a reload).
      if (event.key.length === 1 && event.key !== " ") manager.onKeydown(event);
    },
    setActive(index: number): void {
      manager.updateActiveItem(index);
    },
    isTyping: () => manager.isTyping(),
    destroy(): void {
      subscription.unsubscribe();
      manager.destroy();
    },
  };
}
