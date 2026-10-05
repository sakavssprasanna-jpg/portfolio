/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030712',
          900: '#050a18',
          850: '#081026',
          800: '#0b1633',
          700: '#11224d',
          600: '#1a336f',
        },
        cyber: {
          cyan: '#00f0ff',
          blue: '#3b82f6',
          violet: '#8b5cf6',
          purple: '#a855f7',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
        hologram: {
          cyan: 'rgba(0, 240, 255, 0.15)',
          blue: 'rgba(59, 130, 246, 0.15)',
          violet: 'rgba(139, 92, 246, 0.15)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.4)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.4)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'holo': '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 0 1px 1px rgba(255, 255, 255, 0.1)',
        'card-elevated': '0 10px 40px -10px rgba(0, 0, 0, 0.7)',
        'control-primary': '0 0 0 1px rgba(0, 240, 255, 0.4), 0 8px 24px -4px rgba(0, 240, 255, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 0 rgba(0, 0, 0, 0.4)',
        'control-secondary': '0 0 0 1px rgba(59, 130, 246, 0.3), 0 6px 20px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.1), inset 0 -2px 0 0 rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'orbit-slow': 'orbit 40s linear infinite',
        'beam': 'beam 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
