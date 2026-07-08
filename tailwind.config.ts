import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14110F",
        card: "#1E1A16",
        cardHover: "#241F1A",
        bone: "#F2ECDD",
        muted: "#9C948A",
        amber: "#E8A33D",
        violet: "#8C6FF7",
        green: "#6FCF97",
        line: "rgba(242,236,221,0.09)",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
