/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#050b14',
          900: '#08111d',
          850: '#0c1725',
          800: '#101d2e',
          700: '#17263a',
        },
        neon: {
          cyan: '#22d3ee',
          blue: '#2f7df6',
          green: '#37df8c',
          red: '#ff5f57',
          amber: '#f6b73c',
        },
      },
      boxShadow: {
        soft: '0 20px 70px rgba(22, 26, 36, 0.12)',
        glow: '0 0 0 1px rgba(47, 125, 246, 0.38), 0 18px 60px rgba(0, 0, 0, 0.35)',
        cyan: '0 0 40px rgba(34, 211, 238, 0.16)',
        blue: '0 18px 70px rgba(47, 125, 246, 0.28)',
      },
      backgroundImage: {
        'app-radial':
          'radial-gradient(circle at 20% 0%, rgba(34, 211, 238, 0.12), transparent 30%), radial-gradient(circle at 80% 10%, rgba(47, 125, 246, 0.18), transparent 28%), linear-gradient(135deg, #050b14 0%, #08111d 45%, #0c1725 100%)',
      },
    },
  },
  plugins: [],
}
