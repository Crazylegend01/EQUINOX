import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Crimson Noir theme
        crimson: {
          50:  '#fff0f2',
          100: '#ffe0e5',
          200: '#ffc0ca',
          300: '#ff8fa0',
          400: '#ff4d6a',
          500: '#ff0033',
          600: '#e6002d',
          700: '#bf0025',
          800: '#9e0020',
          900: '#85001c',
        },
        noir: {
          50:  '#f5f5f5',
          100: '#e0e0e0',
          200: '#b0b0b0',
          300: '#787878',
          400: '#545454',
          500: '#1a1a1a',
          600: '#141414',
          700: '#0f0f0f',
          800: '#0a0a0a',
          900: '#000000',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-red': 'pulseRed 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseRed: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'crimson-glow': 'radial-gradient(ellipse at center, rgba(255,0,51,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'crimson': '0 0 20px rgba(255, 0, 51, 0.3)',
        'crimson-sm': '0 0 10px rgba(255, 0, 51, 0.2)',
        'panel': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
