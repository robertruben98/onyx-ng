import type { Meta, StoryObj } from "@storybook/angular";
import { DividerComponent } from "./divider.component";

const meta: Meta<DividerComponent> = {
  title: "Components/Divider",
  component: DividerComponent,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    decorative: { control: "boolean" },
  },
  args: {
    orientation: "horizontal",
    decorative: false,
  },
  render: (args) => ({
    props: args,
    template: `<ui-divider [orientation]="orientation" [decorative]="decorative"></ui-divider>`,
  }),
};
export default meta;

type Story = StoryObj<DividerComponent>;

export const Default: Story = {};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; height: 3rem; align-items: center; gap: 1rem;">
        <span>Left</span>
        <ui-divider [orientation]="orientation" style="height: 100%;"></ui-divider>
        <span>Right</span>
      </div>`,
  }),
};

export const WithLabel: Story = {
  render: (args) => ({
    props: args,
    template: `<ui-divider [orientation]="orientation" [decorative]="decorative">OR</ui-divider>`,
  }),
};

export const Decorative: Story = {
  args: { decorative: true },
};
