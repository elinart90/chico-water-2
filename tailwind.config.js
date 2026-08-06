/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        water: {
          50: '#eef9fc',
          100: '#d6f0f7',
          200: '#b3e2ef',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0077B6',
          700: '#01579B',
          800: '#023E8A',
          900: '#0c1e3d',
          950: '#071526',
        },
        slate: {
          850: '#1a2332',
          950: '#0b1220',
        },
      },
  fontFamily: {
    sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
    display: ['var(--font-display)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
    serif: ['var(--font-serif)', 'Georgia', 'serif'],
    accent: ['var(--font-accent)', 'Georgia', 'serif'],
  },
      boxShadow: {
        soft: '0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)',
        medium: '0 4px 12px rgba(15, 23, 42, 0.08), 0 20px 40px rgba(15, 23, 42, 0.08)',
        glow: '0 0 0 1px rgba(0, 119, 182, 0.08), 0 8px 32px rgba(0, 119, 182, 0.15)',
        'nav': '0 1px 0 rgba(15, 23, 42, 0.05), 0 8px 32px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-in': 'slideIn 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'marquee': 'marquee 35s linear infinite',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
      backgroundImage: {
        'mesh-hero': 'radial-gradient(at 40% 20%, rgba(56, 189, 248, 0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(0, 119, 182, 0.25) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(2, 62, 138, 0.3) 0px, transparent 50%)',
        'mesh-dark': 'radial-gradient(at 20% 80%, rgba(0, 119, 182, 0.12) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(56, 189, 248, 0.08) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
}
