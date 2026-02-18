/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#080808',
        'bg-lab': '#0D0D0D',
        'bg-arena': '#000000',
        'bg-shadow': '#050505',
        'bg-ai': '#F9FAFB',
        surface: '#1e1e2e',
        'text-primary': '#FFFFFF',
        'text-secondary': '#E8EAED',
        muted: '#9AA0A6',
        accent: '#00F5A0',
        'lab-amber': '#FF9500',
        'arena-blue': '#00D4FF',
        'arena-violet': '#BD00FF',
        'shadow-green': '#00FF41',
        'ai-blue': '#0066FF',
        'ai-gold': '#FFD700',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'bounce-arrow': 'bounce-arrow 1.8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'bounce-arrow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', textShadow: '0 0 20px rgba(0,245,160,0.5)' },
          '50%': { opacity: '0.8', textShadow: '0 0 40px rgba(0,245,160,0.8)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
