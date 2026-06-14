import type { Preview } from '@storybook/angular';

// Design tokens + theme presets are injected globally via the `docs:build`
// target's `styles` in angular.json (the Angular Storybook builder consumes it).

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i }
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' }
      ]
    }
  }
};

export default preview;
