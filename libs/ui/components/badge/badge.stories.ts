import type { Meta, StoryObj } from "@storybook/angular";
import { OnyxBadgeComponent } from "./badge.component";

const meta: Meta<OnyxBadgeComponent> = {
  title: "Components/Badge",
  component: OnyxBadgeComponent,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["neutral", "info", "success", "warning", "danger"],
    },
    size: { control: "select", options: ["sm", "md"] },
    dot: { control: "boolean" },
  },
  args: {
    variant: "neutral",
    size: "md",
    dot: false,
  },
  render: (args) => ({
    props: args,
    template: `<onyx-badge
        [variant]="variant"
        [size]="size"
        [dot]="dot"
      >Badge</onyx-badge>`,
  }),
};
export default meta;

type Story = StoryObj<OnyxBadgeComponent>;

export const Neutral: Story = { args: { variant: "neutral" } };
export const Info: Story = { args: { variant: "info" } };
export const Success: Story = { args: { variant: "success" } };
export const Warning: Story = { args: { variant: "warning" } };
export const Danger: Story = { args: { variant: "danger" } };
export const Small: Story = { args: { variant: "neutral", size: "sm" } };
export const DotMode: Story = {
  args: { variant: "success", dot: true },
  render: (args) => ({
    props: args,
    template: `<onyx-badge [variant]="variant" [size]="size" [dot]="dot">Online</onyx-badge>`,
  }),
};
