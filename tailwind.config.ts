import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        madder: { DEFAULT: "#8c1d2c", dark: "#6e1622", light: "#a62a3a" },
        saffron: "#f2a541",
        cream: "#faf6f2",
        ink: "#17130f",
      },
      fontFamily: {
        display: ["Archivo", "Inter", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
