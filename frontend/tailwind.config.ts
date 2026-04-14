import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#232f3e', // Main brand color - professional dark slate
          600: '#1a252f',
          700: '#131b23',
          800: '#0d1117',
          900: '#06080b',
        },
        accent: {
          50: '#fff4e6',
          100: '#ffe9cc',
          200: '#ffd399',
          300: '#ffbd66',
          400: '#ffa733',
          500: '#ff9100', // Accent orange for deals/highlights
          600: '#cc7400',
          700: '#995700',
          800: '#663a00',
          900: '#331d00',
        },
      },
    },
  },
  plugins: [],
}
export default config
