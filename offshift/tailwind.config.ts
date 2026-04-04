import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "tertiary-fixed-dim": "#cec6b2",
        "on-surface": "#1a1c1b",
        "surface-container": "#eeeeec",
        "primary": "#273528",
        "on-tertiary-fixed": "#1f1b0f",
        "error-container": "#ffdad6",
        "outline": "#747871",
        "on-primary-container": "#abbca9",
        "on-tertiary": "#ffffff",
        "on-error": "#ffffff",
        "surface-dim": "#dadad8",
        "on-tertiary-fixed-variant": "#4c4637",
        "tertiary-container": "#4d4839",
        "outline-variant": "#c3c8bf",
        "on-secondary-fixed-variant": "#324d34",
        "primary-container": "#3d4c3d",
        "tertiary-fixed": "#ebe2cd",
        "tertiary": "#363223",
        "surface-container-highest": "#e2e3e1",
        "on-primary-fixed": "#111f12",
        "on-tertiary-container": "#bfb7a3",
        "inverse-surface": "#2f3130",
        "on-surface-variant": "#434842",
        "secondary-fixed-dim": "#b0cfad",
        "surface-container-high": "#e8e8e6",
        "secondary-container": "#cbebc8",
        "surface-container-lowest": "#ffffff",
        "surface": "#f9f9f7",
        "on-error-container": "#93000a",
        "error": "#ba1a1a",
        "secondary-fixed": "#cbebc8",
        "inverse-on-surface": "#f1f1ef",
        "inverse-primary": "#bbcbb8",
        "on-background": "#1a1c1b",
        "on-primary-fixed-variant": "#3c4a3c",
        "primary-fixed": "#d7e7d3",
        "primary-fixed-dim": "#bbcbb8",
        "on-secondary-fixed": "#07200b",
        "on-secondary-container": "#4f6b4f",
        "surface-container-low": "#f4f4f2",
        "on-secondary": "#ffffff",
        "surface-bright": "#f9f9f7",
        "background": "#f9f9f7",
        "surface-variant": "#e2e3e1",
        "secondary": "#4a654a",
        "on-primary": "#ffffff",
        "surface-tint": "#536252"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["Newsreader", "serif"],
        "body": ["Manrope", "sans-serif"],
        "label": ["Manrope", "sans-serif"]
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
