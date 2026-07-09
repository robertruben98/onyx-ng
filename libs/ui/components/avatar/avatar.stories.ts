import type { Meta, StoryObj } from "@storybook/angular";
import { OnyxAvatarComponent } from "./avatar.component";

const meta: Meta<OnyxAvatarComponent> = {
  title: "Components/Avatar",
  component: OnyxAvatarComponent,
  tags: ["autodocs"],
  argTypes: {
    src: { control: "text" },
    name: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    shape: { control: "select", options: ["circle", "square"] },
    status: {
      control: "select",
      options: [null, "online", "offline", "away", "busy"],
    },
  },
  args: {
    src: "",
    name: "Ada Lovelace",
    size: "md",
    shape: "circle",
    status: null,
  },
  render: (args) => ({
    props: args,
    template: `<onyx-avatar
        [src]="src"
        [name]="name"
        [size]="size"
        [shape]="shape"
        [status]="status"
      />`,
  }),
};
export default meta;

type Story = StoryObj<OnyxAvatarComponent>;

export const Initials: Story = { args: { name: "Ada Lovelace" } };
export const Image: Story = {
  args: {
    src: "https://i.pravatar.cc/96?img=5",
    name: "Ada Lovelace",
  },
};
export const Square: Story = { args: { shape: "square" } };
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };
export const Online: Story = { args: { status: "online" } };
export const Busy: Story = { args: { status: "busy", shape: "square" } };
