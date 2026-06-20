import type { Meta, StoryObj } from "@storybook/angular";
import { SkeletonComponent } from "./skeleton.component";

const meta: Meta<SkeletonComponent> = {
  title: "Components/Skeleton",
  component: SkeletonComponent,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["text", "circle", "rect"],
    },
    lines: {
      control: { type: "number", min: 1, max: 10 },
    },
  },
  args: {
    variant: "text",
    lines: 1,
  },
  render: (args) => ({
    props: args,
    template: `<ui-skeleton [variant]="variant" [lines]="lines" />`,
  }),
};
export default meta;

type Story = StoryObj<SkeletonComponent>;

export const Text: Story = { args: { variant: "text", lines: 1 } };

export const TextMultiLine: Story = {
  name: "Text — 3 lines",
  args: { variant: "text", lines: 3 },
};

export const Circle: Story = { args: { variant: "circle" } };

export const Rect: Story = { args: { variant: "rect" } };
