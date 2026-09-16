module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0d1a",
        sidebar: "#0d1120",
        card: "#111827",
        border: "#1e2d45",
        accent: "#3b82f6",
        cyan: {
          DEFAULT: "#06b6d4",
          500: "#06b6d4",
          400: "#22d3ee"
        },
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        textPrimary: "#f1f5f9",
        textSecondary: "#64748b",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'scan': 'scan 2.5s linear infinite',
        'shake': 'shake 0.4s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        }
      }
    },
  },
  plugins: [],
}
