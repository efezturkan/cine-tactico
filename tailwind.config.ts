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
          DEFAULT: "#D9A441",
          hover: "#E5B253",
          active: "#B88225",
        },
        ink: "#E8E6E1",
        muted: "#8A8F9A",
        "team-red": "#E5484D",
        "team-blue": "#4FA3C7",
        scored: "#8EBB70",
        missed: "#E5484D",
        cine: {
          anthracite: "#0B0D12",
          charcoal: "#14171D",
          raised: "#181B22",
          surface: "#14171D",
          "surface-2": "#181B22",
          border: "rgba(255, 255, 255, 0.08)",
          ivory: "#E8E6E1",
          silver: "#8A8F9A",
          amber: "#D9A441",
          gold: "#D9A441",
          cyan: "#4FA3C7",
          crimson: "#E5484D",
          green: "#8EBB70",
        },
        cinema: {
          dark: "#0B0D12",
          card: "#14171D",
          raised: "#181B22",
          border: "rgba(255, 255, 255, 0.08)",
          red: "#E5484D",
          amber: "#D9A441",
          gold: "#D9A441",
          neonBlue: "#4FA3C7",
          neonRed: "#E5484D",
          accent: "#D9A441",
          film: "#0B0D12",
          frame: "#181B22",
          cellBg: "#14171D",
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
