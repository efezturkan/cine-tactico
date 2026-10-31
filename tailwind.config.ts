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
        cinema: {
          // 35mm Velvet Screening Room palette
          dark: "#07080b",        // deepest black (film base)
          card: "#0e1018",        // film cell dark
          border: "#1a1c24",      // subtle frame edge
          red: "#8b151b",         // velvet curtain red (PRIMARY ACCENT)
          amber: "#d97706",       // Kodak film amber
          gold: "#f59e0b",        // reward/trophy gold
          neonBlue: "#06b6d4",    // legacy (kept for compat)
          neonRed: "#f43f5e",     // legacy (kept for compat)
          accent: "#8b5cf6",      // legacy (kept for compat)
          // 35mm extras
          film: "#050505",        // absolute black (sprocket bg)
          frame: "#1e1f28",       // film frame mount
          cellBg: "#0a0b10",      // empty cell background
        }
      },
      fontFamily: {
        mono: ["'Space Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      animation: {
        "pulse-fast": "pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "glow-red": "glow-red 2s ease-in-out infinite alternate",
        "slide-down": "slide-down 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        "slide-up": "slide-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
        "film-flicker": "film-flicker 8s linear infinite",
        "countdown-ring": "countdown-ring 1s linear forwards",
        "reel-spin": "reel-spin 3s linear infinite",
        "shake": "shake 0.4s ease-in-out",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(245, 158, 11, 0.2), 0 0 10px rgba(245, 158, 11, 0.1)" },
          "100%": { boxShadow: "0 0 15px rgba(245, 158, 11, 0.6), 0 0 25px rgba(245, 158, 11, 0.3)" },
        },
        "glow-red": {
          "0%": { boxShadow: "0 0 8px rgba(139, 21, 27, 0.4), 0 0 16px rgba(139, 21, 27, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(139, 21, 27, 0.8), 0 0 40px rgba(139, 21, 27, 0.4)" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-100%)", opacity: "0" },
        },
        "film-flicker": {
          "0%, 95%, 100%": { opacity: "1" },
          "96%": { opacity: "0.85" },
          "97%": { opacity: "1" },
          "98%": { opacity: "0.92" },
          "99%": { opacity: "1" },
        },
        "reel-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-4px)" },
          "40%": { transform: "translateX(4px)" },
          "60%": { transform: "translateX(-3px)" },
          "80%": { transform: "translateX(3px)" },
        },
      }
    },
  },
  plugins: [],
};
export default config;
