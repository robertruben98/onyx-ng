import type { Meta, StoryObj } from "@storybook/angular";
import { OnyxAlertComponent } from "./alert.component";

const meta: Meta<OnyxAlertComponent> = {
  title: "Components/Alert",
  component: OnyxAlertComponent,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "success", "warning", "danger"],
    },
    dismissible: { control: "boolean" },
  },
  args: {
    variant: "info",
    dismissible: false,
  },
  render: (args) => ({
    props: args,
    template: `<onyx-alert [variant]="variant" [dismissible]="dismissible">
      This is an alert message.
    </onyx-alert>`,
  }),
};
export default meta;

type Story = StoryObj<OnyxAlertComponent>;

export const Info: Story = { args: { variant: "info" } };
export const Success: Story = { args: { variant: "success" } };
export const Warning: Story = { args: { variant: "warning" } };
export const Danger: Story = { args: { variant: "danger" } };
export const Dismissible: Story = {
  args: { variant: "info", dismissible: true },
};
export const WithIcon: Story = {
  args: { variant: "success" },
  render: (args) => ({
    props: args,
    template: `<onyx-alert [variant]="variant">
      <span slot="icon">&#10003;</span>
      Your changes have been saved.
    </onyx-alert>`,
  }),
};
