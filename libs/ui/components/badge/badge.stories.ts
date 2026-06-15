import type { Meta, StoryObj } from "@storybook/angular";
import { BadgeComponent } from "./badge.component";

const meta: Meta<BadgeComponent> = {
  title: "Components/Badge",
  component: BadgeComponent,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["neutral", "info", "success", "warning", "danger"],
    },
  },
  args: { variant: "neutral" },
  render: (args) => ({
    props: args,
    template: `<ui-badge [variant]="variant">Badge</ui-badge>`,
  }),
};
export default meta;

type Story = StoryObj<BadgeComponent>;

export const Neutral: Story = { args: { variant: "neutral" } };
export const Info: Story = { args: { variant: "info" } };
export const Success: Story = { args: { variant: "success" } };
export const Warning: Story = { args: { variant: "warning" } };
export const Danger: Story = { args: { variant: "danger" } };
