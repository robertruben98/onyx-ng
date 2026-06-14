import { bootstrapApplication } from '@angular/platform-browser';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from '@onyx/ui/components';

@Component({
  selector: 'ui-root',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ui-button>Onyx UI</ui-button>`
})
export class AppComponent {}

bootstrapApplication(AppComponent).catch((err) => console.error(err));
