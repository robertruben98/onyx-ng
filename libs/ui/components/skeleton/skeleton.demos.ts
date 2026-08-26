import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxStackComponent } from "../stack";
import { OnyxSkeletonComponent } from "./skeleton.component";

const textCode = `<onyx-skeleton />`;
@Component({
  standalone: true,
  imports: [OnyxSkeletonComponent],
  template: textCode,
})
class SkeletonTextDemoComponent {}

const linesCode = `<onyx-skeleton [lines]="3" />`;
@Component({
  standalone: true,
  imports: [OnyxSkeletonComponent],
  template: linesCode,
})
class SkeletonLinesDemoComponent {}

const circleCode = `<onyx-skeleton variant="circle" />`;
@Component({
  standalone: true,
  imports: [OnyxSkeletonComponent],
  template: circleCode,
})
class SkeletonCircleDemoComponent {}

const rectCode = `<onyx-skeleton variant="rect" />`;
@Component({
  standalone: true,
  imports: [OnyxSkeletonComponent],
  template: rectCode,
})
class SkeletonRectDemoComponent {}

const cardCode = `<onyx-stack direction="column" gap="sm">
  <onyx-skeleton variant="rect" />
  <onyx-skeleton [lines]="2" />
</onyx-stack>`;
@Component({
  standalone: true,
  imports: [OnyxSkeletonComponent, OnyxStackComponent],
  template: cardCode,
})
class SkeletonCardDemoComponent {}

export const skeletonDemos: Demo[] = [
  { title: "Text", code: textCode, component: SkeletonTextDemoComponent },
  {
    title: "Text, multiple lines",
    description: "The last line is shorter, as in real paragraphs.",
    code: linesCode,
    component: SkeletonLinesDemoComponent,
  },
  {
    title: "Circle",
    description: "Avatar placeholder.",
    code: circleCode,
    component: SkeletonCircleDemoComponent,
  },
  {
    title: "Rect",
    description: "Card or image placeholder.",
    code: rectCode,
    component: SkeletonRectDemoComponent,
  },
  {
    title: "Card placeholder",
    description: "Shapes compose into the layout they stand in for.",
    code: cardCode,
    component: SkeletonCardDemoComponent,
  },
];
