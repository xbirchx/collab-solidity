/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vscode': {
          'bg': '#1e1e1e',
          'sidebar': '#252526',
          'panel': '#2d2d30',
          'editor': '#1e1e1e',
          'text': '#cccccc',
          'text-secondary': '#858585',
          'border': '#3c3c3c',
          'accent': '#007acc',
          'accent-hover': '#005a9e',
          'error': '#f48771',
          'warning': '#cca700',
          'success': '#89d185'
        }
      }
    },
  },
  plugins: [],
} 