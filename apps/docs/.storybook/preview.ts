import type { Preview } from '@storybook/angular';
import '../../../libs/ui/tokens/dist/tokens.css';
import '../../../libs/ui/themes/dark.css';

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
