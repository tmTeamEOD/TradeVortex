/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 다크모드 활성화
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      animation: {
        float: 'float 3s ease-in-out infinite',
        rotate: 'rotate 6s linear infinite',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-30px)' },
          '100%': { transform: 'translateY(0)' },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },

  plugins: [
          require('@tailwindcss/typography'),

  ],
};
