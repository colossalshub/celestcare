import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        ink: "var(--text)",
        muted: "var(--muted)",
        line: "var(--border)",
        accent: "var(--accent)",
        soft: "var(--accent-soft)",
        caution: "var(--caution)",
        "caution-bg": "var(--caution-bg)",
        block: "var(--block)",
        "block-bg": "var(--block-bg)",
        ok: "var(--ok)",
        "ok-bg": "var(--ok-bg)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        lift: "0 1px 2px rgba(8, 13, 24, 0.05)",
      },
      borderRadius: {
        control: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
