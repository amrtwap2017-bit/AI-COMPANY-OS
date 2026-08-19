// @ts-nocheck
// Triangle Black - Card (enterprise-aligned)
// Maps legacy Card API to enterprise design tokens
// Keeps same props so existing pages work unchanged
interface CardProps {
  children:   React.ReactNode;
  className?: string;
  padding?:   boolean;
}

export function Card({ children, className = "", padding = true }: CardProps) {
  return (
    <div className={"bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden " + className}>
      <div className={padding ? "p-5" : ""}>
        {children}
      </div>
    </div>
  );
}

export function CardHeader({
  title, subtitle, action,
}: {
  title:     string;
  subtitle?: string;
  action?:   React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
        {subtitle && <p className="text-xs text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
