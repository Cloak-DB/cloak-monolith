import type { Config } from 'tailwindcss';

const config: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        white: '#ffffff',
        black: '#000000',
        yellow: {
          50: '#fffef7',
          100: '#fefceb',
          200: '#fef8cd',
          300: '#fef3af',
          400: '#fdea73',
          500: '#FBDB59',
          600: '#e2c44d',
          700: '#bda341',
          800: '#988234',
          900: '#7c6b2b',
        },
        blue: {
          50: '#DAF5F0',
          100: '#c7f1e9',
          200: '#a1ebdf',
          300: '#7be5d5',
          400: '#55dfcb',
          500: '#2fd9c1',
          600: '#26ae9a',
          700: '#1e8373',
          800: '#15584c',
          900: '#0d2e25',
        },
        orange: {
          50: '#fef9f4',
          100: '#fdf3e9',
          200: '#fbe1c7',
          300: '#F9D6B3',
          400: '#f7c89f',
          500: '#f5ba8b',
          600: '#dda77d',
          700: '#b88b68',
          800: '#936f53',
          900: '#785b44',
        },
        purple: {
          50: '#FCDFFF',
          100: '#fbd5ff',
          200: '#f9c0ff',
          300: '#f7abff',
          400: '#f596ff',
          500: '#f381ff',
          600: '#db74e6',
          700: '#b661bf',
          800: '#914d99',
          900: '#773f7d',
        },
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-epilogue)',
          'Epilogue',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        display: [
          'var(--font-epilogue)',
          'Epilogue',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        mono: [
          'var(--font-lexend-mega)',
          'Lexend Mega',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      boxShadow: {
        offset: '6px 6px 0 #000',
      },
      keyframes: {
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
