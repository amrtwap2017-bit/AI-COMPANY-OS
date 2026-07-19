import { ReactNode, ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary"|"secondary"|"ghost"|"danger"|"success";
  size?: "xs"|"sm"|"md"|"lg";
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

const variants = {
  primary:   "bg-amber-700 text-white hover:bg-amber-800 border border-amber-700 shadow-sm",
  secondary: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm",
  ghost:     "bg-transparent text-slate-600 hover:bg-slate-100 border border-transparent",
  danger:    "bg-red-600 text-white hover:bg-red-700 border border-red-600 shadow-sm",
  success:   "bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600 shadow-sm",
};

const sizes = {
  xs: "px-2.5 py-1 text-xs rounded-lg gap-1",
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-5 py-2.5 text-base rounded-xl gap-2",
};

export function Button({ variant="secondary", size="sm", icon, iconRight, loading, children, className="", disabled, ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium transition-all 
        disabled:opacity-50 disabled:cursor-not-allowed 
        active:scale-[0.98] active:shadow-sm
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0 mr-2" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      
      <span className="truncate">{children}</span>
      
      {iconRight && !loading && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
}
