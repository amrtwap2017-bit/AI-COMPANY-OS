import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT:  "var(--color-brand)",
          hover:    "var(--color-brand-hover)",
          light:    "var(--color-brand-light)",
          mid:      "var(--color-brand-mid)",
        },
        surface:   "var(--color-surface)",
        bg: {
          DEFAULT:  "var(--color-bg)",
          alt:      "var(--color-bg-alt)",
        },
        sidebar: {
          DEFAULT:  "var(--color-sidebar)",
          hover:    "var(--color-sidebar-hover)",
        },
        "text-1":  "var(--color-text-1)",
        "text-2":  "var(--color-text-2)",
        "text-3":  "var(--color-text-3)",
        "text-inv":"var(--color-text-inv)",
        border: {
          DEFAULT:  "var(--color-border)",
          focus:    "var(--color-border-focus)",
        },
        status: {
          success:  "var(--color-success)",
          warning:  "var(--color-warning)",
          error:    "var(--color-error)",
          info:     "var(--color-info)",
        },
      },
      borderRadius: {
        "sm":  "var(--radius-sm)",
        "md":  "var(--radius-md)",
        "lg":  "var(--radius-lg)",
        "xl":  "var(--radius-xl)",
        "full":"var(--radius-full)",
      },
      boxShadow: {
        "sm":  "var(--shadow-sm)",
        "md":  "var(--shadow-md)",
        "lg":  "var(--shadow-lg)",
      },
      transitionDuration: {
        "fast":  "var(--duration-fast)",
        "base":  "var(--duration-base)",
        "slow":  "var(--duration-slow)",
      },
      zIndex: {
        "topbar":  "30",
        "sidebar": "40",
        "modal":   "50",
        "drawer":  "60",
        "tooltip": "70",
        "toast":   "80",
      },
      maxWidth: {
        "content": "1400px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
