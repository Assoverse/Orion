import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orion: {
          blue: "#3B82F6",
          dark: "#0F172A",
        },
      },
    },
  },
  plugins: [],
};

export default config;
