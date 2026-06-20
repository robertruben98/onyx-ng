import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";
import { TemplatePortal } from "@angular/cdk/portal";
import type { OverlayRef } from "@angular/cdk/overlay";
import { UiOverlay } from "@onyx/ui/primitives";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

let nextSelectId = 0;

/**
 * Single-select dropdown implementing ControlValueAccessor. Trigger is a
 * `role=combobox`; the panel is a `role=listbox` rendered through the overlay
 * primitive (CDK) with full keyboard support and `aria-activedescendant`.
 */
@Component({
  selector: "onyx-select",
  standalone: true,
  templateUrl: "./select.component.html",
  styleUrl: "./select.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "[class.ui-select]": "true" },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OnyxSelectComponent),
      multi: true,
    },
  ],
})
export class OnyxSelectComponent implements ControlValueAccessor {
  private readonly overlay = inject(UiOverlay);
  private readonly viewContainerRef = inject(ViewContainerRef);

  /** Available options. */
  readonly options = input<SelectOption[]>([]);
  /** Placeholder shown when nothing is selected. */
  readonly placeholder = input("Select…");
  /** Accessible name for the combobox (falls back to the placeholder). */
  readonly ariaLabel = input("");
  /** Disabled state (also driven by forms via setDisabledState). */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly uid = nextSelectId++;
  protected readonly listboxId = `ui-select-listbox-${this.uid}`;

  protected readonly value = signal<string | null>(null);
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  private readonly cvaDisabled = signal(false);

  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );
  protected readonly selectedLabel = computed(
    () => this.options().find((o) => o.value === this.value())?.label ?? "",
  );
  protected readonly activeId = computed(() =>
    this.activeIndex() >= 0 ? this.optionId(this.activeIndex()) : null,
  );

  private readonly panelTpl = viewChild<TemplateRef<unknown>>("panel");
  private readonly trigger =
    viewChild<ElementRef<HTMLButtonElement>>("trigger");
  private overlayRef?: OverlayRef;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose());
  }

  // --- ControlValueAccessor ------------------------------------------------
  writeValue(value: string | null): void {
    this.value.set(value ?? null);
  }
  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected optionId(index: number): string {
    return `ui-select-option-${this.uid}-${index}`;
  }

  protected toggle(): void {
    if (this.isDisabled()) return;
    if (this.open()) {
      this.close();
    } else {
      this.openPanel();
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (!this.open()) this.openPanel();
    }
  }

  protected onListboxKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this.activeIndex.set(this.nextEnabled(this.activeIndex(), 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        this.activeIndex.set(this.nextEnabled(this.activeIndex(), -1));
        break;
      case "Home":
        event.preventDefault();
        this.activeIndex.set(this.nextEnabled(-1, 1));
        break;
      case "End":
        event.preventDefault();
        this.activeIndex.set(this.nextEnabled(this.options().length, -1));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        this.selectOption(this.activeIndex());
        break;
      case "Escape":
      case "Tab":
        this.close();
        break;
    }
  }

  protected selectOption(index: number): void {
    const opt = this.options()[index];
    if (!opt || opt.disabled) return;
    this.value.set(opt.value);
    this.onChange(opt.value);
    this.close();
  }

  private openPanel(): void {
    const tpl = this.panelTpl();
    const trigger = this.trigger();
    if (!tpl || !trigger) return;
    const ref = this.overlay.createConnected(trigger, {
      placement: "bottom",
      align: "start",
      hasBackdrop: true,
      panelClass: "ui-select__pane",
    });
    this.overlayRef = ref;
    ref.updateSize({ width: trigger.nativeElement.offsetWidth });
    ref.attach(new TemplatePortal(tpl, this.viewContainerRef));
    ref.backdropClick().subscribe(() => this.close());

    const selected = this.options().findIndex((o) => o.value === this.value());
    this.activeIndex.set(selected >= 0 ? selected : this.nextEnabled(-1, 1));
    this.open.set(true);
    queueMicrotask(() =>
      ref.overlayElement.querySelector<HTMLElement>("[role=listbox]")?.focus(),
    );
  }

  private close(): void {
    if (!this.overlayRef) return;
    this.overlayRef.dispose();
    this.overlayRef = undefined;
    this.open.set(false);
    this.onTouched();
    this.trigger()?.nativeElement.focus();
  }

  /** First enabled option index walking `step` from `from`, wrapping. */
  private nextEnabled(from: number, step: number): number {
    const opts = this.options();
    const n = opts.length;
    if (!n) return -1;
    for (let k = 1; k <= n; k++) {
      const i = (((from + step * k) % n) + n) % n;
      if (!opts[i].disabled) return i;
    }
    return from;
  }
}
