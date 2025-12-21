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
      }
    }
  },
  plugins: [],
}
