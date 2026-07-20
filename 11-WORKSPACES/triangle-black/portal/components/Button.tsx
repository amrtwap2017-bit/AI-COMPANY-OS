// @ts-nocheck
// Triangle Black - Button (enterprise-aligned)
// Maps legacy Button API to enterprise design tokens

interface ButtonProps {
  children:   React.ReactNode;
  type?:      "button" | "submit" | "reset";
  variant?:   "primary" | "secondary" | "danger" | "ghost";
  size?:      "sm" | "md" | "lg";
  onClick?:   () => void;
  disabled?:  boolean;
  loading?:   boolean;
  className?: string;
}

const variants: Record<string, string> = {
  primary:   "bg-amber-600 text-white hover:bg-amber-700 border-transparent",
  secondary: "bg-white text-slate-700 hover:bg-slate-50 border-slate-200",
  danger:    "bg-red-600 text-white hover:bg-red-700 border-transparent",
  ghost:     "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent",
};

const sizes: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export function Button({
  children,
  type      = "button",
  variant   = "primary",
  size      = "md",
  onClick,
  disabled  = false,
  loading   = false,
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center gap-2 font-semibold rounded-xl border transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      ].join(" ")}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
