/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        dimWhite: "var(--dimWhite)",
        dimBlue: "var(--dimBlue)",
        textPrimary: "var(--text-primary)",
        bgPrimary: "var(--bg-primary)",
        cardBg: "var(--card-bg)",
        borderColor: "var(--border-color)",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
    screens: {
      xs: "480px",
      ss: "620px",
      sm: "768px",
      md: "1060px",
      lg: "1200px",
      xl: "1700px",
    },
  },
  darkMode: "class",
  plugins: [],
};
