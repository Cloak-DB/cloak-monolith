# @cloak/tailwind-config

Shared Tailwind CSS configuration for all Cloak DB apps.

## Usage

```ts
import type { Config } from 'tailwindcss';
import baseConfig from '@cloak/tailwind-config';

const config: Config = {
  presets: [baseConfig],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};

export default config;
```

## Design System

- **Colors**: Custom palette with yellow, blue, orange, purple, green, red
- **Fonts**: Epilogue (sans/display), Lexend Mega (mono)
- **Shadow**: offset shadow utility
