import type { Meta, StoryObj } from "@storybook/angular";
import { OnyxInputComponent } from "./input.component";

const meta: Meta<OnyxInputComponent> = {
  title: "Components/Input",
  component: OnyxInputComponent,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url", "search"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    label: { control: "text" },
    placeholder: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    type: "email",
    size: "md",
    label: "Email",
    placeholder: "you@example.com",
    hint: "",
    error: "",
    invalid: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <onyx-input
        [type]="type"
        [size]="size"
        [label]="label"
        [placeholder]="placeholder"
        [hint]="hint"
        [error]="error"
        [invalid]="invalid"
        [disabled]="disabled"
      />
    `,
  }),
};
export default meta;

type Story = StoryObj<OnyxInputComponent>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hint: "We'll never share your email." },
};

export const Invalid: Story = {
  args: { error: "Enter a valid email address." },
};

export const Disabled: Story = { args: { disabled: true } };

export const Sizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <onyx-input size="sm" label="Small" placeholder="sm" />
      <onyx-input size="md" label="Medium" placeholder="md" />
      <onyx-input size="lg" label="Large" placeholder="lg" />
    `,
  }),
};

export const PrefixAndSuffix: Story = {
  args: { type: "number", label: "Amount", placeholder: "0.00" },
  render: (args) => ({
    props: args,
    template: `
      <onyx-input
        [type]="type"
        [label]="label"
        [placeholder]="placeholder"
      >
        <span slot="prefix">$</span>
        <span slot="suffix">USD</span>
      </onyx-input>
    `,
  }),
};
