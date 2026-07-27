import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // ── SEMANTIC COLORS — use these, not slate-900 ──────────
      colors: {
        // Brand
        brand: {
          DEFAULT: "var(--color-brand)",
          hover:   "var(--color-brand-hover)",
          light:   "var(--color-brand-light)",
          mid:     "var(--color-brand-mid)",
          muted:   "var(--color-brand-muted)",
        },
        // Surfaces
        surface:  "var(--color-surface)",
        "surface-alt": "var(--color-surface-alt)",
        base:     "var(--color-bg)",
        "base-alt": "var(--color-bg-alt)",
        overlay:  "var(--color-overlay)",
        // Sidebar
        sidebar: {
          DEFAULT:  "var(--color-sidebar)",
          hover:    "var(--color-sidebar-hover)",
          active:   "var(--color-sidebar-active)",
          border:   "var(--color-sidebar-border)",
          text:     "var(--color-sidebar-text)",
        },
        // Topbar
        topbar: {
          DEFAULT: "var(--color-topbar)",
          border:  "var(--color-topbar-border)",
        },
        // Text hierarchy
        "text-primary":   "var(--color-text-1)",
        "text-secondary": "var(--color-text-2)",
        "text-tertiary":  "var(--color-text-3)",
        "text-disabled":  "var(--color-text-disabled)",
        "text-inverse":   "var(--color-text-inv)",
        "text-brand":     "var(--color-text-brand)",
        // Borders
        border: {
          DEFAULT: "var(--color-border)",
          hover:   "var(--color-border-hover)",
          focus:   "var(--color-border-focus)",
          strong:  "var(--color-border-strong)",
        },
        divider: "var(--color-divider)",
        // Semantic status
        success: {
          DEFAULT: "var(--color-success)",
          bg:      "var(--color-success-bg)",
          border:  "var(--color-success-border)",
          text:    "var(--color-success-text)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          bg:      "var(--color-warning-bg)",
          border:  "var(--color-warning-border)",
          text:    "var(--color-warning-text)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          bg:      "var(--color-danger-bg)",
          border:  "var(--color-danger-border)",
          text:    "var(--color-danger-text)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          bg:      "var(--color-info-bg)",
          border:  "var(--color-info-border)",
          text:    "var(--color-info-text)",
        },
        // Operational status
        status: {
          operational: "var(--color-status-operational)",
          fault:       "var(--color-status-fault)",
          maintenance: "var(--color-status-maintenance)",
          offline:     "var(--color-status-offline)",
          critical:    "var(--color-status-critical)",
          pending:     "var(--color-status-pending)",
          completed:   "var(--color-status-completed)",
          cancelled:   "var(--color-status-cancelled)",
          overdue:     "var(--color-status-overdue)",
        },
      },

      // ── FONT FAMILY ─────────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },

      // ── BORDER RADIUS ───────────────────────────────────────
      borderRadius: {
        sm:   "var(--radius-sm)",    // 6px — buttons, badges
        md:   "var(--radius-md)",    // 8px — inputs
        lg:   "var(--radius-lg)",    // 12px — cards small
        xl:   "var(--radius-xl)",    // 16px — cards standard
        "2xl": "var(--radius-2xl)", // 20px — cards large
        full: "var(--radius-full)",  // 9999px — pills
      },

      // ── SHADOWS ─────────────────────────────────────────────
      boxShadow: {
        none: "var(--shadow-none)",
        sm:   "var(--shadow-sm)",
        md:   "var(--shadow-md)",
        lg:   "var(--shadow-lg)",
        xl:   "var(--shadow-xl)",
      },

      // ── ANIMATION ───────────────────────────────────────────
      transitionDuration: {
        fast: "var(--duration-fast)",    // 100ms
        base: "var(--duration-base)",    // 150ms
        slow: "var(--duration-slow)",    // 250ms
      },

      // ── Z-INDEX ─────────────────────────────────────────────
      zIndex: {
        topbar:  "30",
        sidebar: "40",
        modal:   "50",
        drawer:  "60",
        tooltip: "70",
        toast:   "80",
        command: "90",
      },

      // ── MAX WIDTH ───────────────────────────────────────────
      maxWidth: {
        content: "var(--content-max)",
        readable: "72ch",
      },

      // ── TYPOGRAPHY ──────────────────────────────────────────
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },

      // ── SPACING ─────────────────────────────────────────────
      // 8px base system — keep Tailwind defaults, just add semantic names
      spacing: {
        page: "var(--page-padding)",
      },
    },
  },
  plugins: [],
};

export default config;
