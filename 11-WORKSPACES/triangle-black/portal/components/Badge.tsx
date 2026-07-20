// @ts-nocheck
// Triangle Black - Badge (enterprise-aligned)
// Maps legacy Badge API to enterprise design tokens

interface BadgeProps {
  children:   React.ReactNode;
  className?: string;
  color?:     string;
  bg?:        string;
}

export function Badge({
  children,
  className = "",
  color = "text-slate-600",
  bg    = "bg-slate-100",
}: BadgeProps) {
  return (
    <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold " + color + " " + bg + " " + className}>
      {children}
    </span>
  );
}
