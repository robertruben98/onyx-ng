import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxSelectComponent, SelectOption } from "./select.component";

const basicCode = `<onyx-select [formControl]="framework" [options]="options" />`;
@Component({
  standalone: true,
  imports: [OnyxSelectComponent, ReactiveFormsModule],
  template: basicCode,
})
class SelectBasicDemoComponent {
  protected readonly framework = new FormControl<string | null>(null);
  protected readonly options: SelectOption[] = [
    { value: "ng", label: "Angular" },
    { value: "rx", label: "RxJS" },
    { value: "sd", label: "Style Dictionary" },
    { value: "nx", label: "Nx", disabled: true },
  ];
}

export const selectDemos: Demo[] = [
  { title: "Basic", code: basicCode, component: SelectBasicDemoComponent },
];
