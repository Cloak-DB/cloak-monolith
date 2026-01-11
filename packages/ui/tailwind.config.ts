import type { Config } from 'tailwindcss';
import baseConfig from '@cloak-db/tailwind-config';

const config: Config = {
  presets: [baseConfig],
  content: ['./components/**/*.{js,ts,jsx,tsx}'],
};

export default config;
