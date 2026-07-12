/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- THIS IS THE MAGIC LINE
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}