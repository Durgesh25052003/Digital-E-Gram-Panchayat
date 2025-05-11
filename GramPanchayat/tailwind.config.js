/** @type {import('tailwindcss').Config} */
export const content = [
  "./src/**/*.{js,jsx,ts,tsx}",
  "./public/index.html",
];
export const theme = {
  extend: {
    colors: {
      primary: '#1a365d',
      secondary: '#2d3748',
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
  },
};
export const plugins = [];