import type { Meta, StoryObj } from "@storybook/angular";
import { RadioGroupComponent } from "./radio-group.component";

const meta: Meta<RadioGroupComponent> = {
  title: "Components/RadioGroup",
  component: RadioGroupComponent,
  tags: ["autodocs"],
  argTypes: {
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Size",
    invalid: false,
    disabled: false,
    options: [
      { label: "Small", value: "sm" },
      { label: "Medium", value: "md" },
      { label: "Large", value: "lg" },
    ],
  },
  render: (args) => ({
    props: args,
    template: `<ui-radio-group
        [label]="label"
        [options]="options"
        [invalid]="invalid"
        [disabled]="disabled"
      />`,
  }),
};
export default meta;

type Story = StoryObj<RadioGroupComponent>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const WithDisabledOption: Story = {
  args: {
    options: [
      { label: "Small", value: "sm" },
      { label: "Medium", value: "md" },
      { label: "Large (soon)", value: "lg", disabled: true },
    ],
  },
};
