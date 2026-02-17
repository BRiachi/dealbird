/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: "#C8FF00",
          dim: "#9FCC00",
          light: "rgba(200,255,0,0.12)",
        },
        brand: {
          black: "#0A0A0A",
          dark: "#111111",
          card: "#1A1A1A",
          900: "#1C1C1C",
          800: "#2A2A2A",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};
