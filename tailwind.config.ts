import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#ef4444", // Crimson Red accent
          hover: "#dc2626",
          dark: "#991b1b",
          light: "#f87171"
        },
        surface: {
          DEFAULT: "#121216",
          elevated: "#18181f",
          border: "#262630",
          hover: "#22222c"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      aspectRatio: {
        'poster': '3 / 4',
        'vertical': '9 / 16'
      }
    },
  },
  plugins: [],
};
export default config;
