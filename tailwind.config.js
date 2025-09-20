/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'orange-light': '#fff8f5',
        'orange-primary': '#ff8c42',
        'orange-dark': '#e67c3a',
      },
    },
  },
  plugins: [],
}