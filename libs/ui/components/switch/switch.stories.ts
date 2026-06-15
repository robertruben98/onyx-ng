import type { Meta, StoryObj } from "@storybook/angular";
import { SwitchComponent } from "./switch.component";

const meta: Meta<SwitchComponent> = {
  title: "Components/Switch",
  component: SwitchComponent,
  tags: ["autodocs"],
  argTypes: {
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Enable notifications",
    invalid: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<ui-switch
        [label]="label"
        [invalid]="invalid"
        [disabled]="disabled"
      />`,
  }),
};
export default meta;

type Story = StoryObj<SwitchComponent>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const NoLabel: Story = { args: { label: "", ariaLabel: "Dark mode" } };
