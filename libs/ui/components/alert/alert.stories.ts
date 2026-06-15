import type { Meta, StoryObj } from "@storybook/angular";
import { AlertComponent } from "./alert.component";

const meta: Meta<AlertComponent> = {
  title: "Components/Alert",
  component: AlertComponent,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["neutral", "info", "success", "warning", "danger"],
    },
    dismissible: { control: "boolean" },
  },
  args: {
    variant: "info",
    title: "Heads up",
    dismissible: false,
  },
  render: (args) => ({
    props: args,
    template: `<ui-alert
        [variant]="variant"
        [title]="title"
        [dismissible]="dismissible"
      >This is an alert message with some details.</ui-alert>`,
  }),
};
export default meta;

type Story = StoryObj<AlertComponent>;

export const Info: Story = { args: { variant: "info" } };
export const Success: Story = { args: { variant: "success" } };
export const Warning: Story = { args: { variant: "warning" } };
export const Danger: Story = { args: { variant: "danger" } };
export const Dismissible: Story = { args: { dismissible: true } };
