import { Component } from "@angular/core";
import { Demo } from "@onyx/ui/docs-model";
import { OnyxEmptyStateComponent } from "./empty-state.component";

const basicCode = `<onyx-empty-state>
  <svg slot="icon" viewBox="0 0 24 24" width="48" height="48">
    <path fill="currentColor" d="M4 5h16v14H4z" opacity=".2" />
    <path fill="currentColor" d="M7 9h10v2H7zm0 4h7v2H7z" />
  </svg>
  <span slot="title">No projects yet</span>
  <span slot="description">Create a project to start organizing your work.</span>
  <span slot="primary-action">Create project</span>
  <span slot="secondary-action">Import project</span>
</onyx-empty-state>`;
@Component({
  standalone: true,
  imports: [OnyxEmptyStateComponent],
  template: basicCode,
})
class EmptyStateBasicDemoComponent {}

const illustrationCode = `<onyx-empty-state role="status">
  <svg slot="illustration" viewBox="0 0 64 64" width="64" height="64">
    <circle cx="32" cy="32" r="28" fill="currentColor" opacity=".15" />
    <path fill="currentColor" d="M20 29h24v6H20zm9-9h6v24h-6z" />
  </svg>
  <span slot="title">You're all caught up</span>
  <span slot="description">New activity will appear here when it arrives.</span>
</onyx-empty-state>`;
@Component({
  standalone: true,
  imports: [OnyxEmptyStateComponent],
  template: illustrationCode,
})
class EmptyStateIllustrationDemoComponent {}

const disabledCode = `<onyx-empty-state disabled>
  <span slot="title">Service unavailable</span>
  <span slot="description">Actions are unavailable while the service reconnects.</span>
  <span slot="primary-action">Try again</span>
  <span slot="secondary-action">View status</span>
</onyx-empty-state>`;
@Component({
  standalone: true,
  imports: [OnyxEmptyStateComponent],
  template: disabledCode,
})
class EmptyStateDisabledDemoComponent {}

export const emptyStateDemos: Demo[] = [
  {
    title: "Actions and icon",
    description:
      "Action slots are rendered as native buttons with primary and secondary emphasis.",
    code: basicCode,
    component: EmptyStateBasicDemoComponent,
  },
  {
    title: "Illustration and status",
    description:
      "Use role=status when a dynamically inserted empty state should be announced.",
    code: illustrationCode,
    component: EmptyStateIllustrationDemoComponent,
  },
  {
    title: "Disabled actions",
    description:
      "Disabled state removes both actions from keyboard and pointer interaction.",
    code: disabledCode,
    component: EmptyStateDisabledDemoComponent,
  },
];
