import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        /* Penalty Mentality Soft Game Palette */
        night: "#0B1220",
        panel: "#121A2B",
        control: {
          DEFAULT: "#16213A",
          hover: "#1E2B48",
        },
        gold: {
          DEFAULT: "#F5C451",
          hover: "#FFD97A",
          active: "#C9A13F",
        },
        ink: "#F4F6FA",
        muted: "#9AA6BD",
        "team-red": "#FF6B4A",
        "team-blue": "#4C9AFF",
        scored: "#3DDC84",
        missed: "#FF5A5F",
        cine: {
          anthracite: "#0B1220",
          charcoal: "#121A2B",
          raised: "#16213A",
          border: "#243252",
          ivory: "#F4F6FA",
          silver: "#9AA6BD",
          amber: "#F5C451",
          cyan: "#4C9AFF",
          crimson: "#FF5A5F",
          green: "#3DDC84",
        },
        cinema: {
          dark: "#0B1220",
          card: "#121A2B",
          raised: "#16213A",
          border: "#243252",
          red: "#FF5A5F",
          amber: "#F5C451",
          gold: "#F5C451",
          neonBlue: "#4C9AFF",
          neonRed: "#FF6B4A",
          accent: "#F5C451",
          film: "#0B1220",
          frame: "#16213A",
          cellBg: "#121A2B",
        },
      },
      fontFamily: {
        display: [
          "'Barlow Condensed'",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "sans-serif",
        ],
        sans: [
          "'Inter'",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        serif: [
          "'Newsreader'",
          "Georgia",
          "Cambria",
          "'Times New Roman'",
          "Times",
          "serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      animation: {
        "pulse-fast": "pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "card-in": "card-in 0.35s ease-out both",
        "banner-in": "banner-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "reel-spin": "reel-spin 4s linear infinite",
        shake: "shake 0.18s ease-in-out",
      },
      keyframes: {
        "card-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(12px) scale(0.98)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },
        "banner-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.85)",
          },
          "60%": {
            opacity: "1",
            transform: "scale(1.03)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "reel-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-3px)" },
          "75%": { transform: "translateX(3px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
