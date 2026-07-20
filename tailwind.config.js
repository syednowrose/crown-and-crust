/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Crown & Crust sandalwood palette
        sandalwood: {
          50:  '#fdf8f3',
          100: '#f8eee3',
          200: '#eed9c0',
          300: '#e2c09a',
          400: '#d4a574',
          500: '#C2A177', // primary sandalwood
          600: '#b08860',
          700: '#9a7050',
          800: '#7d5a41',
          900: '#654836',
        },
        espresso: {
          50:  '#f5f0eb',
          100: '#e8ddd3',
          200: '#d0baa7',
          300: '#b8987b',
          400: '#9e7655',
          500: '#7a5c3e',
          600: '#624a32',
          700: '#4a3826',
          800: '#2d221a', // deep espresso
          900: '#1a130e',
        },
        cream: {
          50:  '#FFFEF9',
          100: '#FFF8EE',
          200: '#FFF0D6',
          300: '#FFE8BE',
          400: '#FFD9A0',
          500: '#F5C97B',
        },
        gold: {
          400: '#D4A843',
          500: '#C69A2C',
          600: '#B88B1A',
        },
      },
      fontFamily: {
        serif:  ['Playfair Display', 'Georgia', 'serif'],
        sans:   ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'sandalwood-gradient': 'linear-gradient(135deg, #fdf8f3 0%, #f8eee3 50%, #eed9c0 100%)',
        'espresso-gradient':   'linear-gradient(135deg, #2d221a 0%, #4a3826 100%)',
        'gold-shimmer':        'linear-gradient(90deg, #C2A177, #D4A843, #C2A177)',
      },
      boxShadow: {
        'sandalwood': '0 4px 24px rgba(194,161,119,0.25)',
        'espresso':   '0 4px 24px rgba(45,34,26,0.18)',
        'card':       '0 2px 16px rgba(194,161,119,0.12)',
        'card-hover': '0 8px 32px rgba(194,161,119,0.28)',
      },
      borderRadius: {
        'xl2': '1.25rem',
        '2xl': '1.5rem',
      },
      animation: {
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0'  },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)'    },
          '50%':      { transform: 'translateY(-6px)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,168,67,0.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(212,168,67,0)' },
        },
      },
    },
  },
  plugins: [],
}
