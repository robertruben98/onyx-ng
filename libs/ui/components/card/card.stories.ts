import type { Meta, StoryObj } from "@storybook/angular";
import { CardComponent } from "./card.component";

const meta: Meta<CardComponent> = {
  title: "Components/Card",
  component: CardComponent,
  tags: ["autodocs"],
  argTypes: {
    interactive: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    interactive: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-card [interactive]="interactive" [disabled]="disabled">
        <span slot="header">Card Header</span>
        <p>Card body content goes here. This is the default projection slot.</p>
        <span slot="footer">Card Footer</span>
      </ui-card>
    `,
  }),
};
export default meta;

type Story = StoryObj<CardComponent>;

export const Default: Story = { args: { interactive: false, disabled: false } };
export const Interactive: Story = {
  args: { interactive: true, disabled: false },
};
export const Disabled: Story = { args: { interactive: true, disabled: true } };
export const NoSlots: Story = {
  args: { interactive: false, disabled: false },
  render: (args) => ({
    props: args,
    template: `<ui-card [interactive]="interactive" [disabled]="disabled">Body only — no header or footer.</ui-card>`,
  }),
};
