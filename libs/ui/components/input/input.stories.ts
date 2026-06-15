import type { Meta, StoryObj } from "@storybook/angular";
import { InputComponent } from "./input.component";

const meta: Meta<InputComponent> = {
  title: "Components/Input",
  component: InputComponent,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url", "search"],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
  },
  args: {
    label: "Email",
    placeholder: "you@example.com",
    type: "email",
    size: "md",
    disabled: false,
    invalid: false,
  },
  render: (args) => ({
    props: args,
    template: `<ui-input
        [label]="label"
        [placeholder]="placeholder"
        [type]="type"
        [size]="size"
        [disabled]="disabled"
        [invalid]="invalid"
      />`,
  }),
};
export default meta;

type Story = StoryObj<InputComponent>;

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };
export const NoLabel: Story = {
  args: {
    label: "",
    ariaLabel: "Search",
    type: "search",
    placeholder: "Search…",
  },
};
