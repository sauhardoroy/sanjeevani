/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          green: "#34C759",
          amber: "#FF9F0A",
          red: "#FF3B30",
          blue: "#007AFF",
          bg: "#F2F2F7",
          surface: "#FFFFFF",
          textPrimary: "#1C1C1E",
          textSecondary: "#6E6E73",
          separator: "#E5E5EA",
        }
      },
      borderRadius: {
        'sheet': '28px',
        'nav': '24px',
        'card': '20px',
        'btn': '14px',
        'chip': '10px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'apple-card': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'apple-glass': '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'apple-fab': '0 10px 25px -3px rgba(0, 122, 255, 0.35), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'apple-sheet': '0 -10px 40px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
