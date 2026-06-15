import type { Meta, StoryObj } from "@storybook/angular";
import { CheckboxComponent } from "./checkbox.component";

const meta: Meta<CheckboxComponent> = {
  title: "Components/Checkbox",
  component: CheckboxComponent,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    indeterminate: { control: "boolean" },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Accept terms",
    size: "md",
    indeterminate: false,
    invalid: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<ui-checkbox
        [label]="label"
        [size]="size"
        [indeterminate]="indeterminate"
        [invalid]="invalid"
        [disabled]="disabled"
      />`,
  }),
};
export default meta;

type Story = StoryObj<CheckboxComponent>;

export const Default: Story = {};
export const Indeterminate: Story = { args: { indeterminate: true } };
export const Invalid: Story = { args: { invalid: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };
