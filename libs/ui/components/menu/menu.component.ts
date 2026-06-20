import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { TemplatePortal } from "@angular/cdk/portal";
import type { OverlayRef } from "@angular/cdk/overlay";
import { UiOverlay } from "@onyx/ui/primitives";

export interface MenuItem {
  /** Stable identifier for the action. */
  id?: string;
  /** Visible label. */
  label: string;
  /** Whether the item is disabled. */
  disabled?: boolean;
}

let nextMenuId = 0;

/**
 * Dropdown menu of actions. Trigger is a button with `aria-haspopup=menu`; the
 * panel is a `role=menu` rendered through the overlay primitive (CDK), with
 * focus moved onto items and full keyboard navigation.
 */
@Component({
  selector: "onyx-menu",
  standalone: true,
  templateUrl: "./menu.component.html",
  styleUrl: "./menu.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class.ui-menu]": "true" },
})
export class OnyxMenuComponent {
  private readonly overlay = inject(UiOverlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  /** Menu items. */
  readonly items = input<MenuItem[]>([]);

  /** Emitted with the chosen item when activated. */
  readonly itemSelect = output<MenuItem>();

  protected readonly menuId = `ui-menu-${nextMenuId++}`;
  protected readonly open = signal(false);

  private readonly panelTpl = viewChild<TemplateRef<unknown>>("panel");
  private readonly trigger =
    viewChild<ElementRef<HTMLButtonElement>>("trigger");
  private overlayRef?: OverlayRef;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose());
  }

  protected toggle(): void {
    if (this.open()) {
      this.close();
    } else {
      this.openMenu();
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (!this.open()) this.openMenu();
    }
  }

  protected onMenuKeydown(event: KeyboardEvent): void {
    const items = this.itemElements();
    if (!items.length) return;
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        items[(current + 1) % items.length].focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        items[(current - 1 + items.length) % items.length].focus();
        break;
      case "Home":
        event.preventDefault();
        items[0].focus();
        break;
      case "End":
        event.preventDefault();
        items[items.length - 1].focus();
        break;
      case "Escape":
      case "Tab":
        this.close();
        break;
    }
  }

  protected activate(item: MenuItem): void {
    if (item.disabled) return;
    this.itemSelect.emit(item);
    this.close();
  }

  private openMenu(): void {
    const tpl = this.panelTpl();
    const trigger = this.trigger();
    if (!tpl || !trigger) return;
    const ref = this.overlay.createConnected(trigger, {
      placement: "bottom",
      align: "start",
      hasBackdrop: true,
      panelClass: "ui-menu__pane",
    });
    this.overlayRef = ref;
    ref.attach(new TemplatePortal(tpl, this.viewContainerRef));
    ref.backdropClick().subscribe(() => this.close());
    this.open.set(true);
    queueMicrotask(() => this.itemElements()[0]?.focus());
  }

  private close(): void {
    if (!this.overlayRef) return;
    this.overlayRef.dispose();
    this.overlayRef = undefined;
    this.open.set(false);
    this.trigger()?.nativeElement.focus();
  }

  /** Enabled menuitem buttons currently in the overlay. */
  private itemElements(): HTMLButtonElement[] {
    const el = this.overlayRef?.overlayElement;
    if (!el) return [];
    return Array.from(
      el.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not([disabled])',
      ),
    );
  }
}
