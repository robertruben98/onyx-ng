import type { Meta, StoryObj } from "@storybook/angular";
import { OnyxDividerComponent } from "./divider.component";

const meta: Meta<OnyxDividerComponent> = {
  title: "Components/Divider",
  component: OnyxDividerComponent,
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
    template: `<onyx-divider [orientation]="orientation" [decorative]="decorative"></onyx-divider>`,
  }),
};
export default meta;

type Story = StoryObj<OnyxDividerComponent>;

export const Default: Story = {};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; height: 3rem; align-items: center; gap: 1rem;">
        <span>Left</span>
        <onyx-divider [orientation]="orientation" style="height: 100%;"></onyx-divider>
        <span>Right</span>
      </div>`,
  }),
};

export const WithLabel: Story = {
  render: (args) => ({
    props: args,
    template: `<onyx-divider [orientation]="orientation" [decorative]="decorative">OR</onyx-divider>`,
  }),
};

export const Decorative: Story = {
  args: { decorative: true },
};
