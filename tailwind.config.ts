import type { Config } from "tailwindcss";

// Kongu AI Academy — premium dark system.
// Token names are kept from earlier versions so every page re-themes at once:
// ink = primary text, mute = secondary text, rule/line = borders, cream/panel = surfaces, madder = brand blue.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#070B18",
        deep: "#101A35",
        panel: "#0C1328",
        cream: "#0E1631",
        ink: "#F7F9FF",
        mute: "#A7B0C3",
        rule: "#1C2543",
        line: "#2A3560",
        madder: { DEFAULT: "#386BFF", dark: "#2A55E0", light: "#5B86FF" },
        saffron: "#386BFF",
        cyan: "#00D4FF",
        gold: "#D6B46A",
      },
      fontFamily: {
        display: ["Sora", "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: { xl: "12px", "2xl": "16px", lg: "10px" },
      boxShadow: {
        glow: "0 0 0 1px rgba(56,107,255,.35), 0 10px 40px -10px rgba(56,107,255,.45)",
      },
    },
  },
  plugins: [],
};
export default config;
