module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e40af',
          light: '#3b82f6',
          dark: '#1e3a8a',
        },
        secondary: {
          DEFAULT: '#047857',
          light: '#10b981',
          dark: '#065f46',
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}