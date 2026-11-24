/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10243b',
        paper: '#f5f4ef',
        mint: '#d9f2e5',
        coral: '#ee816d',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 16px 44px rgba(23, 43, 66, .07)',
      },
    },
  },
  plugins: [],
}
