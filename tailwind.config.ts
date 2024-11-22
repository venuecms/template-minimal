import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        black: "hsl(var(--black))",
        highlight: "hsl(var(--text-highlight))",
        "text-1": "hsl(var(--text-1))",
        "text-2": "hsl(var(--text-2))",
        "text-3": "hsl(var(--text-3))",
        "text-nav": "hsl(var(--text-nav))",
        "button-background": "hsl(var(--button-background))",
        error: "hsl(var(--error))",
        overlay: "hsl(var(--overlay) / 0.8)",
        "footer-background": "hsl(var(--footer-background))",
        "panel-background": "hsl(var(--panel-background))",
        "panel-background-2": "hsl(var(--panel-background-2) / 0.2)",
      },
      fontSize: {
        sm: ["1rem", "1.5rem"],
        md: ["1rem", "1.5rem"],
        xl: ["2rem", "2.5rem"],
      },
      fontWeight: {
        light: "300",
        regular: "300",
      },
    },
  },
};
