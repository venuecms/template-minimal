import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: ["font-bold", "line-through", "underline", "italic"],
  theme: {
    extend: {
      colors: {
        background: "hsla(var(--background))",
        black: "hsla(var(--black))",
        highlight: "hsla(var(highlight))",
        primary: "hsla(var(--primary))",
        secondary: "hsla(var(--secondary))",
        "text-3": "hsla(var(--text-3))",
        nav: "hsla(var(--nav))",
        "button-background": "hsla(var(--button-background))",
        error: "hsla(var(--error))",
        overlay: "hsla(var(--overlay))",
        "footer-background": "hsla(var(--footer-background))",
        "panel-background": "hsla(var(--panel-background))",
        "panel-background-2": "hsla(var(--panel-background-2))",
      },
      fontFamily: {
        base: ["var(--font-ibm-plex-mono)", "system-ui", "sans-serif"],
      },
      fontSize: {
        sm: ["1rem", "1.3rem"],
        md: ["1rem", "1.3rem"],
        xl: ["2rem", "2.5rem"],
      },
      fontWeight: {
        light: "300",
        regular: "500",
      },
    },
  },
};
