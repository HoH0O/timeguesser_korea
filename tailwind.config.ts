import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#0a0a14",
          900: "#10101c",
          800: "#1a1a2c",
          700: "#26263a",
        },
        accent: {
          gold: "#f5c14b",
          rose: "#ff5470",
        },
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-12px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(12px)" },
        },
        "correct-pulse": {
          "0%": { boxShadow: "0 0 0 0 rgba(34,197,94,0.7)" },
          "70%": { boxShadow: "0 0 0 32px rgba(34,197,94,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "count-up": {
          "0%": { transform: "translateY(80%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        shake: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
        "correct-pulse": "correct-pulse 0.9s ease-out 1",
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "count-up": "count-up 0.4s cubic-bezier(.4,1.6,.6,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
