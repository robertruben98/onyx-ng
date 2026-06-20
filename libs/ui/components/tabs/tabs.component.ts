import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  contentChildren,
  effect,
  input,
  model,
  viewChildren,
} from "@angular/core";
import { TabComponent } from "./tab.component";

/**
 * Tabbed interface. Renders a `role=tablist` of triggers from the projected
 * `ui-tab` children and shows the selected panel. Full keyboard support
 * (arrows / Home / End) with roving tabindex.
 */
@Component({
  selector: "onyx-tabs",
  standalone: true,
  templateUrl: "./tabs.component.html",
  styleUrl: "./tabs.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class.ui-tabs]": "true" },
})
export class TabsComponent {
  /** Accessible label for the tab list. */
  readonly ariaLabel = input("");
  /** Selected tab index. Two-way bindable. */
  readonly selectedIndex = model(0);

  protected readonly tabs = contentChildren(TabComponent);
  private readonly triggers =
    viewChildren<ElementRef<HTMLButtonElement>>("trigger");

  constructor() {
    // Reflect the selection onto each child panel.
    effect(() => {
      const selected = this.selectedIndex();
      this.tabs().forEach((tab, i) => tab.active.set(i === selected));
    });
  }

  protected select(index: number): void {
    if (this.tabs()[index]?.disabled()) return;
    this.selectedIndex.set(index);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const last = this.tabs().length - 1;
    let target: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        target = this.nextEnabled(index, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        target = this.nextEnabled(index, -1);
        break;
      case "Home":
        target = this.nextEnabled(-1, 1);
        break;
      case "End":
        target = this.nextEnabled(last + 1, -1);
        break;
      default:
        return;
    }
    if (target === null) return;
    event.preventDefault();
    this.selectedIndex.set(target);
    this.triggers()[target]?.nativeElement.focus();
  }

  /** First enabled index walking `step` from `from` (exclusive), wrapping. */
  private nextEnabled(from: number, step: number): number | null {
    const tabs = this.tabs();
    const n = tabs.length;
    if (!n) return null;
    for (let k = 1; k <= n; k++) {
      const i = (((from + step * k) % n) + n) % n;
      if (!tabs[i].disabled()) return i;
    }
    return null;
  }
}
