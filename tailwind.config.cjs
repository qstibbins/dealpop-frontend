module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#e6f6fb',
        pink: '#f9cfe4',
        accent: '#ff0099',
        grayText: '#666',
        // Status badge colors with better contrast ratios
        status: {
          tracking: {
            50: '#ecfdf5',
            100: '#d1fae5',
            200: '#a7f3d0',
            700: '#047857',
            800: '#065f46',
          },
          paused: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            700: '#b45309',
            800: '#92400e',
          },
          completed: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            700: '#1d4ed8',
            800: '#1e40af',
          },
          triggered: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            700: '#b91c1c',
            800: '#991b1b',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}; 