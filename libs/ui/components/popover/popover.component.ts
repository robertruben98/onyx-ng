import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  signal,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { A11yModule } from "@angular/cdk/a11y";

/**
 * Floating popover surface attached to an overlay by `OnyxPopoverDirective`.
 * Renders projected template content, traps focus (CDK) and exposes
 * `role=dialog`.
 */
@Component({
  selector: "onyx-popover",
  standalone: true,
  imports: [NgTemplateOutlet, A11yModule],
  templateUrl: "./popover.component.html",
  styleUrl: "./popover.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnyxPopoverComponent {
  /** Content template to render inside the popover. */
  readonly content = signal<TemplateRef<unknown> | null>(null);
  /** Accessible label for the popover dialog. */
  readonly label = signal("");
}
