import type { Config } from 'tailwindcss';
import baseConfig from '@cloak-db/tailwind-config';

const config: Config = {
  presets: [baseConfig],
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/components/**/*.{js,ts,jsx,tsx}',
  ],
};

export default config;
