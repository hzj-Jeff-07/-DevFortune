/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        wuxing: {
          wood: '#4CAF50',
          fire: '#F44336',
          earth: '#FF9800',
          metal: '#9E9E9E',
          water: '#2196F3',
        },
      },
    },
  },
  plugins: [],
};
