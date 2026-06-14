import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output
} from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'ui-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ui-button]': 'true',
    '[class.ui-button--primary]': "variant() === 'primary'",
    '[class.ui-button--secondary]': "variant() === 'secondary'",
    '[class.ui-button--text]': "variant() === 'text'",
    '[class.ui-button--sm]': "size() === 'sm'",
    '[class.ui-button--lg]': "size() === 'lg'",
    '[class.ui-button--loading]': 'loading()',
    '[class.ui-button--disabled]': 'disabled()'
  }
})
export class ButtonComponent {
  /** Visual variant. */
  readonly variant = input<ButtonVariant>('primary');
  /** Control size. */
  readonly size = input<ButtonSize>('md');
  /** Native button type. */
  readonly type = input<ButtonType>('button');
  /** Disabled state — a disabled button never emits `clicked`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Loading state — shows a spinner and suppresses interaction. */
  readonly loading = input(false, { transform: booleanAttribute });

  /** Emitted on activation (pointer or keyboard) when interactive. */
  readonly clicked = output<MouseEvent>();

  /** A disabled or loading button is not interactive. */
  protected readonly isInteractive = computed(
    () => !this.disabled() && !this.loading()
  );

  protected handleClick(event: MouseEvent): void {
    if (!this.isInteractive()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.clicked.emit(event);
  }
}
