import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'text']
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' }
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false
  },
  render: (args) => ({
    props: args,
    template: `<ui-button
        [variant]="variant"
        [size]="size"
        [disabled]="disabled"
        [loading]="loading"
      >Button</ui-button>`
  })
};
export default meta;

type Story = StoryObj<ButtonComponent>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Text: Story = { args: { variant: 'text' } };
export const Loading: Story = { args: { variant: 'primary', loading: true } };
export const Disabled: Story = { args: { variant: 'primary', disabled: true } };
