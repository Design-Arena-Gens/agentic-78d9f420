import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#f2f6ff",
          100: "#e3edff",
          200: "#c5d9ff",
          300: "#98bbff",
          400: "#6a9aff",
          500: "#3c74ff",
          600: "#2454db",
          700: "#1b3fa8",
          800: "#122a75",
          900: "#091642"
        }
      }
    }
  },
  plugins: []
};

export default config;
