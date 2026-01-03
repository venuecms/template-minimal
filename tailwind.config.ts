import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "font-bold",
    "line-through",
    "underline",
    "italic",
    "hover:underline",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsla(var(--background))",
        black: "hsla(var(--black))",
        highlight: "hsla(var(highlight))",
        primary: "hsla(var(--primary))",
        secondary: "hsla(var(--secondary))",
        muted: "hsla(var(--muted))",
        "text-3": "hsla(var(--text-3))",
        nav: "hsla(var(--nav))",
        "button-background": "hsla(var(--button-background))",
        error: "hsla(var(--error))",
        overlay: "hsla(var(--overlay))",
        "footer-background": "hsla(var(--footer-background))",
        "panel-background": "hsla(var(--panel-background))",
        "panel-background-2": "hsla(var(--panel-background-2))",
      },
      fontSize: {
        sm: ["clamp(1.00rem, calc(0.92rem + 0.39vw), 1.25rem)", "1.5rem"],
        md: ["clamp(1.20rem, calc(1.02rem + 0.88vw), 1.77rem);", "1.5rem"],
        lg: ["clamp(1.44rem, calc(1.11rem + 1.65vw), 2.50rem);", "2.4rem"],
        xl: ["2rem", "2.5rem"],
      },
      fontWeight: {
        light: "300",
        regular: "500",
      },
    },
  },
};
