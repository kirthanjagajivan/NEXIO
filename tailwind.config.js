/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        nexio: {
          navy: '#0F172A',
          card: '#1E293B',
          border: '#334155',
          blue: '#3B82F6',
          orange: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
};
