import type { Meta, StoryObj } from "@storybook/angular";
import { OnyxSliderComponent } from "./slider.component";

const meta: Meta<OnyxSliderComponent> = {
  title: "Components/Slider",
  component: OnyxSliderComponent,
  tags: ["autodocs"],
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Volume",
    min: 0,
    max: 100,
    step: 5,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <onyx-slider
        [label]="label"
        [min]="min"
        [max]="max"
        [step]="step"
        [disabled]="disabled"
      />
    `,
  }),
};
export default meta;

type Story = StoryObj<OnyxSliderComponent>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const FineGrained: Story = {
  args: { min: -50, max: 50, step: 1, label: "Offset" },
};
