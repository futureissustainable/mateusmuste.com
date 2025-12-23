import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      sans: ['PPNeueBit', 'sans-serif'],
      serif: ['PPNeueBit', 'sans-serif'],
      mono: ['PPNeueBit', 'sans-serif'],
    },
    extend: {
      fontFamily: {
        heading: ['PPMondwest', 'sans-serif'],
        body: ['PPNeueBit', 'sans-serif'],
        ascii: ['VT323', 'Courier New', 'Consolas', 'monospace'],
      },
      colors: {
        bg: '#E8E8E8',
        fg: '#000000',
        crimson: '#DC143C',
        'code-green': '#00FF41',
        gray: {
          50: '#FAFAFA',
          100: '#F0F0F0',
          200: '#E0E0E0',
          300: '#C0C0C0',
          400: '#909090',
          500: '#606060',
          600: '#333333',
        },
      },
      animation: {
        'window-fold-in': 'windowFoldIn 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'window-fold-out': 'windowFoldOut 0.15s cubic-bezier(0.55, 0, 1, 0.45) forwards',
        shake: 'shake 0.5s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'icon-shake': 'iconShake 0.15s ease-in-out infinite',
      },
      keyframes: {
        windowFoldIn: {
          '0%': {
            opacity: '0',
            transform: 'perspective(800px) rotateX(-90deg) scaleY(0)',
          },
          '100%': {
            opacity: '1',
            transform: 'perspective(800px) rotateX(0deg) scaleY(1)',
          },
        },
        windowFoldOut: {
          '0%': {
            opacity: '1',
            transform: 'perspective(800px) rotateX(0deg) scaleY(1)',
          },
          '100%': {
            opacity: '0',
            transform: 'perspective(800px) rotateX(-90deg) scaleY(0)',
          },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.8) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        iconShake: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
