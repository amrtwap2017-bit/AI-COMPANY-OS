// @ts-nocheck
// Triangle Black - Progress Component
// UI-029: Progress bar and circular ring

interface ProgressBarProps {
  value:     number;
  max?:      number;
  label?:    string;
  showValue?: boolean;
  color?:    "amber" | "emerald" | "blue" | "red" | "slate";
  size?:     "sm" | "md" | "lg";
  className?: string;
}

const COLORS: Record<string, string> = {
  amber:   "bg-amber-500",
  emerald: "bg-emerald-500",
  blue:    "bg-blue-500",
  red:     "bg-red-500",
  slate:   "bg-slate-400",
};

const HEIGHTS: Record<string, string> = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

export function Progress({
  value, max = 100, label, showValue = false,
  color = "amber", size = "md", className = ""
}: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const barColor = pct >= 90 ? COLORS.red : pct >= 70 ? COLORS.amber : COLORS[color] || COLORS.amber;
  return (
    <div className={"w-full " + className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-secondary">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold text-primary">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div
        className={"w-full bg-surface-alt rounded-full overflow-hidden " + HEIGHTS[size]}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={"h-full rounded-full transition-all duration-500 " + barColor}
          style={{ width: pct + "%" }}
        />
      </div>
    </div>
  );
}
