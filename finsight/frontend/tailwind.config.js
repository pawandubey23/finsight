/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F3EC',
        ink: '#1C2430',
        inkmuted: '#5B6472',
        ledger: '#0F3D2E',
        emerald: '#1F7A5C',
        rust: '#B24B2C',
        gold: '#B8863B',
        line: '#DDD7C7'
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      }
    }
  },
  plugins: []
};
