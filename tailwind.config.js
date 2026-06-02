/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'ocean-blue': '#9333EA',
        'brand': '#9333EA',
        'medium-slate-blue': '#9333EA',
        'deep-purple': '#7E22CE',
        'brand-muted': '#F3E8FF',

        // Secondary Colors
        'sunshine-yellow': '#FFD93D',
        'coral-pink': '#FF6B9D',
        'mint-green': '#6BCF7F',

        // Neutral Colors
        'soft-gray': '#F5F7FA',
        'charcoal': '#2D3748',
        'light-gray': '#E2E8F0',

        // Semantic Colors
        'success-green': '#48BB78',
        'warning-orange': '#F6AD55',
        'error-red': '#FC8181',
        'info-blue': '#63B3ED',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'cursive': ['Clicker Script', 'cursive'],
        'noticia': ['"Noticia Text"', 'serif'],
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-card': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-success': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-scoreboard': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FFD700, #FFA500)',
        'gradient-silver': 'linear-gradient(135deg, #C0C0C0, #808080)',
        'gradient-bronze': 'linear-gradient(135deg, #CD7F32, #8B4513)',
      },
      boxShadow: {
        'button': '0 4px 12px rgba(147, 51, 234, 0.3)',
        'button-hover': '0 8px 20px rgba(147, 51, 234, 0.4)',
        'card': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'card-hover': '0 16px 40px rgba(0, 0, 0, 0.2)',
        'modal': '0 20px 60px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'bounce-gentle': 'bounce-gentle 0.3s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-slow': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'bounce-gentle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px)' },
          '50%': { transform: 'translateX(10px)' },
          '75%': { transform: 'translateX(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
