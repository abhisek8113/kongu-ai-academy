import type { Config } from "tailwindcss";

// Design language: a technical lab manual.
// White paper, black ink, hairline rules, one Kongu red signal colour, IBM Plex type.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        madder: { DEFAULT: "#b3261e", dark: "#8f1d17", light: "#c9372d" },
        saffron: "#b3261e",
        cream: "#f5f5f3",
        ink: "#111111",
        rule: "#d9d9d6",
        mute: "#5f5f5b",
      },
      fontFamily: {
        display: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: { xl: "2px", "2xl": "2px", lg: "2px", full: "9999px" },
    },
  },
  plugins: [],
};
export default config;
