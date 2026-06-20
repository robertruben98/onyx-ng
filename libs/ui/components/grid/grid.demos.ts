import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxGridComponent, OnyxGridItemDirective } from "./grid.component";

const responsiveCode = `<onyx-grid
  [columns]="1"
  [columnsSm]="2"
  [columnsMd]="3"
  gap="md"
>
  <article>Analytics</article>
  <article>Activity</article>
  <article>Tasks</article>
</onyx-grid>`;

@Component({
  standalone: true,
  imports: [OnyxGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: responsiveCode,
})
class GridResponsiveDemoComponent {}

const spansCode = `<onyx-grid [columns]="4" gap="sm">
  <article onyxGridItem [span]="2">Half width</article>
  <article onyxGridItem [span]="2">Half width</article>
  <footer onyxGridItem span="full">Full row</footer>
</onyx-grid>`;

@Component({
  standalone: true,
  imports: [OnyxGridComponent, OnyxGridItemDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: spansCode,
})
class GridSpansDemoComponent {}

const adaptiveSpansCode = `<onyx-grid
  [columns]="1"
  [columnsSm]="4"
  [columnsLg]="12"
  gap="lg"
>
  <nav onyxGridItem [spanSm]="1" [spanLg]="3">Navigation</nav>
  <main onyxGridItem [spanSm]="3" [spanLg]="9">Content</main>
</onyx-grid>`;

@Component({
  standalone: true,
  imports: [OnyxGridComponent, OnyxGridItemDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: adaptiveSpansCode,
})
class GridAdaptiveSpansDemoComponent {}

export const gridDemos: Demo[] = [
  {
    title: "Responsive columns",
    description:
      "Resize the demo: breakpoints react to the grid container, not the viewport.",
    code: responsiveCode,
    component: GridResponsiveDemoComponent,
  },
  {
    title: "Column spans",
    code: spansCode,
    component: GridSpansDemoComponent,
  },
  {
    title: "Responsive layout",
    description:
      "Span helpers decorate semantic elements without introducing wrappers.",
    code: adaptiveSpansCode,
    component: GridAdaptiveSpansDemoComponent,
  },
];
