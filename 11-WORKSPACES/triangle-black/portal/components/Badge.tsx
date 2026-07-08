import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  bg?: string;
}

export function Badge({ children, className, color = "text-gray-700", bg = "bg-gray-100" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        color, bg, className
      )}
    >
      {children}
    </span>
  );
}
