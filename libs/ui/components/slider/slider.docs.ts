import { ComponentDoc } from "@onyx/ui/docs-model";
import { sliderDemos } from "./slider.demos";

export const sliderDoc: ComponentDoc = {
  id: "slider",
  title: "Slider",
  description:
    "Single-value slider with keyboard support, min/max/step bounds, and ControlValueAccessor integration.",
  api: [
    {
      name: "min",
      type: "number",
      default: "0",
      description: "Lower bound of the slider range.",
    },
    {
      name: "max",
      type: "number",
      default: "100",
      description: "Upper bound of the slider range.",
    },
    {
      name: "step",
      type: "number",
      default: "1",
      description: "Increment used for keyboard and input changes.",
    },
    {
      name: "label",
      type: "string",
      default: "''",
      description: "Visible label rendered above the control.",
    },
    {
      name: "ariaLabel",
      type: "string",
      default: "''",
      description: "Accessible name when no visible label is provided.",
    },
    {
      name: "disabled",
      type: "boolean",
      default: "false",
      description: "Disables the slider.",
    },
    {
      name: "(valueChange)",
      type: "number",
      default: "-",
      description: "Emitted when the value changes.",
    },
  ],
  demos: sliderDemos,
};
