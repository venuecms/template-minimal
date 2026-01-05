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
        xs: ["clamp(0.8681rem, 0.8374rem + 0.1362vw, 0.96rem);", "clamp(1.0417rem, 0.9889rem + 0.2346vw, 1.2rem);"],
        sm: ["clamp(1.0417rem, 0.9889rem + 0.2346vw, 1.2rem);", "clamp(1.25rem, 1.1667rem + 0.3704vw, 1.5rem);"],
        md: ["clamp(1.25rem, 1.1667rem + 0.3704vw, 1.5rem);", "clamp(1.875rem, 1.75rem + 0.5556vw, 2.25rem);"],
        lg: ["clamp(1.25rem, 1.1667rem + 0.3704vw, 1.5rem);", "clamp(1.75rem, 1.6667rem + 0.3704vw, 2rem);"],
        xl: ["clamp(1.5rem, 1.375rem + 0.5556vw, 1.875rem);", "clamp(2.5rem, 2.3333rem + 0.7407vw, 3rem);"],
      },
      fontWeight: {
        light: "300",
        regular: "500",
      },
    },
  },
};
