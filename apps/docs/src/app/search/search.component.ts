import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { NAV } from "../nav";

/** A flat, navigable search result with its global keyboard index. */
interface ResultItem {
  path: string;
  label: string;
  index: number;
}

/** A titled group of {@link ResultItem}s, mirroring the nav sections. */
interface ResultGroup {
  title: string;
  items: ResultItem[];
}

/**
 * ⌘K command palette for the docs site. Filters the global {@link NAV} and
 * navigates with the keyboard. Open it via the trigger button, Cmd/Ctrl+K, or
 * "/" — close with Escape, a backdrop click, or selecting a result.
 */
@Component({
  selector: "docs-search",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      #trigger
      type="button"
      class="docs-search__trigger"
      (click)="openPalette()"
      aria-label="Search documentation"
      aria-keyshortcuts="Meta+K Control+K"
    >
      <svg
        class="docs-search__icon"
        viewBox="0 0 16 16"
        width="15"
        height="15"
        aria-hidden="true"
      >
        <path
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          d="M7 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm3.5-1.5L14 14"
        />
      </svg>
      <span class="docs-search__trigger-label">Search…</span>
      <kbd class="docs-search__kbd">⌘K</kbd>
    </button>

    @if (open()) {
      <div class="docs-search__backdrop" (click)="close()">
        <div
          class="docs-search__dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Search documentation"
          (click)="$event.stopPropagation()"
        >
          <div class="docs-search__field">
            <svg
              class="docs-search__icon"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              aria-hidden="true"
            >
              <path
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                d="M7 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm3.5-1.5L14 14"
              />
            </svg>
            <input
              #searchInput
              type="text"
              class="docs-search__input"
              placeholder="Search documentation…"
              role="combobox"
              aria-expanded="true"
              aria-controls="docs-search-list"
              [attr.aria-activedescendant]="activeId()"
              [value]="query()"
              (input)="onInput($event)"
              (keydown)="onKeydown($event)"
            />
            <kbd class="docs-search__kbd docs-search__kbd--esc">Esc</kbd>
          </div>

          <div
            id="docs-search-list"
            class="docs-search__list"
            role="listbox"
            aria-label="Search results"
          >
            @if (groups().length === 0) {
              <p class="docs-search__empty" aria-live="polite">
                No results for “{{ query() }}”
              </p>
            }
            @for (g of groups(); track g.title) {
              <div
                class="docs-search__group"
                role="group"
                [attr.aria-label]="g.title"
              >
                <span class="docs-search__group-title" aria-hidden="true">{{
                  g.title
                }}</span>
                @for (it of g.items; track it.path) {
                  <div
                    role="option"
                    class="docs-search__opt"
                    [id]="'docs-search-opt-' + it.index"
                    [class.is-active]="it.index === activeIndex()"
                    [attr.aria-selected]="it.index === activeIndex()"
                    (click)="select(it.index)"
                    (mouseenter)="activeIndex.set(it.index)"
                  >
                    <span class="docs-search__opt-label">{{ it.label }}</span>
                    <span class="docs-search__opt-path">{{ it.path }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .docs-search__trigger {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        height: 2rem;
        padding: 0 0.6rem;
        border: 1px solid var(--ui-color-border);
        border-radius: 0.5rem;
        background: var(--ui-color-surface);
        color: var(--ui-color-text-muted);
        font: inherit;
        font-size: 0.85rem;
        cursor: pointer;
        transition:
          border-color 0.15s ease,
          color 0.15s ease;
      }
      .docs-search__trigger:hover {
        border-color: var(--ui-color-primary);
        color: var(--ui-color-text);
      }
      .docs-search__trigger:focus-visible {
        outline: 2px solid var(--ui-focus-ring);
        outline-offset: 2px;
      }
      .docs-search__trigger-label {
        min-width: 4rem;
        text-align: left;
      }
      .docs-search__icon {
        flex: none;
      }
      .docs-search__kbd {
        font-family: var(--docs-mono);
        font-size: 0.7rem;
        line-height: 1;
        padding: 0.2rem 0.35rem;
        border: 1px solid var(--ui-color-border);
        border-radius: 0.3rem;
        background: var(--ui-color-surface-hover);
        color: var(--ui-color-text-muted);
      }
      .docs-search__backdrop {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 12vh 1rem 1rem;
        background: color-mix(in srgb, var(--ui-color-text) 35%, transparent);
        backdrop-filter: blur(2px);
      }
      .docs-search__dialog {
        width: 100%;
        max-width: 34rem;
        max-height: 70vh;
        display: flex;
        flex-direction: column;
        background: var(--ui-color-surface);
        border: 1px solid var(--ui-color-border);
        border-radius: var(--docs-radius);
        box-shadow: var(--docs-shadow-panel);
        overflow: hidden;
      }
      .docs-search__field {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.85rem 1rem;
        border-bottom: 1px solid var(--ui-color-border);
        color: var(--ui-color-text-muted);
      }
      .docs-search__input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        color: var(--ui-color-text);
        font: inherit;
        font-size: 1rem;
      }
      .docs-search__kbd--esc {
        flex: none;
      }
      .docs-search__list {
        overflow-y: auto;
        padding: 0.5rem;
      }
      .docs-search__group + .docs-search__group {
        margin-top: 0.5rem;
      }
      .docs-search__group-title {
        display: block;
        padding: 0.4rem 0.6rem 0.25rem;
        font-size: 0.6875rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ui-color-text-muted);
      }
      .docs-search__opt {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.5rem 0.6rem;
        border-radius: 0.5rem;
        cursor: pointer;
        color: var(--ui-color-text);
      }
      .docs-search__opt.is-active {
        background: color-mix(
          in srgb,
          var(--ui-color-primary) 12%,
          transparent
        );
        color: var(--ui-color-primary);
      }
      .docs-search__opt-path {
        font-family: var(--docs-mono);
        font-size: 0.75rem;
        color: var(--ui-color-text-muted);
        white-space: nowrap;
      }
      .docs-search__opt.is-active .docs-search__opt-path {
        color: var(--ui-color-primary);
      }
      .docs-search__empty {
        margin: 0;
        padding: 1.5rem 0.6rem;
        text-align: center;
        color: var(--ui-color-text-muted);
        font-size: 0.9rem;
      }
      @media (max-width: 480px) {
        .docs-search__trigger-label {
          display: none;
        }
        .docs-search__kbd {
          display: none;
        }
      }
    `,
  ],
})
export class SearchComponent {
  private readonly router = inject(Router);
  private readonly trigger =
    viewChild<ElementRef<HTMLButtonElement>>("trigger");
  private readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>("searchInput");

  /** Whether the palette overlay is currently shown. */
  readonly open = signal(false);
  protected readonly query = signal("");
  protected readonly activeIndex = signal(0);

  private readonly normalizedQuery = computed(() =>
    this.query().trim().toLowerCase(),
  );

  /** Nav entries filtered by the query, grouped and flat-indexed. */
  protected readonly groups = computed<ResultGroup[]>(() => {
    const q = this.normalizedQuery();
    const out: ResultGroup[] = [];
    let index = 0;
    for (const section of NAV) {
      const items: ResultItem[] = [];
      for (const item of section.items) {
        if (!q || item.label.toLowerCase().includes(q)) {
          items.push({ path: item.path, label: item.label, index: index++ });
        }
      }
      if (items.length) out.push({ title: section.title, items });
    }
    return out;
  });

  private readonly flat = computed<ResultItem[]>(() =>
    this.groups().flatMap((g) => g.items),
  );

  protected readonly activeId = computed(() =>
    this.flat().length ? `docs-search-opt-${this.activeIndex()}` : null,
  );

  /** Opens the palette, resets the query, and focuses the input. */
  openPalette(): void {
    this.query.set("");
    this.activeIndex.set(0);
    this.open.set(true);
    setTimeout(() => this.searchInput()?.nativeElement.focus(), 0);
  }

  protected close(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.trigger()?.nativeElement.focus();
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.flat().length;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (count) this.activeIndex.update((i) => (i + 1) % count);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (count) this.activeIndex.update((i) => (i - 1 + count) % count);
        break;
      case "Enter":
        event.preventDefault();
        if (count) this.select(this.activeIndex());
        break;
      case "Escape":
        event.preventDefault();
        this.close();
        break;
    }
  }

  protected select(index: number): void {
    const item = this.flat().find((f) => f.index === index);
    if (!item) return;
    this.open.set(false);
    void this.router.navigate([item.path]);
    this.trigger()?.nativeElement.focus();
  }

  @HostListener("document:keydown", ["$event"])
  protected onGlobalKey(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    if ((event.metaKey || event.ctrlKey) && key === "k") {
      event.preventDefault();
      if (this.open()) this.close();
      else this.openPalette();
      return;
    }
    if (this.open()) return;
    if (key === "/" && !this.isTypingTarget(event.target)) {
      event.preventDefault();
      this.openPalette();
    }
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
  }
}
