/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'sans': ['PPNeueBit', 'sans-serif'],
      'serif': ['PPNeueBit', 'sans-serif'],
      'mono': ['PPNeueBit', 'sans-serif'],
    },
    extend: {
      fontFamily: {
        'heading': ['PPMondwest', 'sans-serif'],
        'body': ['PPNeueBit', 'sans-serif'],
      },
      colors: {
        'bg': '#E8E8E8',
        'fg': '#000000',
        'crimson': '#DC143C',
        'code-green': '#00FF41',
      },
    },
  },
  plugins: [],
}
