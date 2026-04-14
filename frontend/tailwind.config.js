/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#f3efe9",
          panel: "#fffdf8",
          ink: "#132126",
          muted: "#6b7c86",
          line: "#d9d2c6",
          accent: "#0f766e",
          accentSoft: "#d8f0ec",
          warm: "#a16207",
          warmSoft: "#faecd1",
          danger: "#b42318",
          dangerSoft: "#f7d6d1",
        },
      },
      fontFamily: {
        display: ["\"Space Grotesk\"", "sans-serif"],
        body: ["\"Manrope\"", "sans-serif"],
      },
      boxShadow: {
        panel: "0 18px 40px rgba(19, 33, 38, 0.08)",
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: 0, transform: "translateY(18px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        riseIn: "riseIn 0.45s ease-out forwards",
      },
    },
  },
  plugins: [],
};
