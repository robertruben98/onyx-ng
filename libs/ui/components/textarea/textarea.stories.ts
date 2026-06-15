import type { Meta, StoryObj } from "@storybook/angular";
import { TextareaComponent } from "./textarea.component";

const meta: Meta<TextareaComponent> = {
  title: "Components/Textarea",
  component: TextareaComponent,
  tags: ["autodocs"],
  argTypes: {
    rows: { control: "number" },
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
  },
  args: {
    label: "Bio",
    placeholder: "Tell us about yourself…",
    rows: 3,
    disabled: false,
    invalid: false,
  },
  render: (args) => ({
    props: args,
    template: `<ui-textarea
        [label]="label"
        [placeholder]="placeholder"
        [rows]="rows"
        [disabled]="disabled"
        [invalid]="invalid"
      />`,
  }),
};
export default meta;

type Story = StoryObj<TextareaComponent>;

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true } };
export const Disabled: Story = { args: { disabled: true } };
export const NoLabel: Story = {
  args: { label: "", ariaLabel: "Notes", placeholder: "Notes…" },
};
