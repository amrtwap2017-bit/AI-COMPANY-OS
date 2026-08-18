// @ts-nocheck
// Triangle Black - Avatar Component
// UI-025: User avatar with initials fallback
interface AvatarProps {
  name?:    string;
  src?:     string;
  size?:    "xs" | "sm" | "md" | "lg" | "xl";
  online?:  boolean;
  className?: string;
}

const SIZES: Record<string, string> = {
  xs: "w-6 h-6 text-[9px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

const INDICATOR: Record<string, string> = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-3.5 h-3.5",
};

function getInitials(name?: string): string {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function getBgColor(name?: string): string {
  const colors = [
    "bg-amber-600", "bg-blue-600", "bg-emerald-600",
    "bg-purple-600", "bg-rose-600", "bg-indigo-600",
  ];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
}

export function Avatar({ name, src, size = "md", online, className = "" }: AvatarProps) {
  return (
    <div className={"relative inline-flex flex-shrink-0 " + className}>
      <div className={"rounded-full overflow-hidden flex items-center justify-center " + SIZES[size] + " " + (src ? "" : getBgColor(name))}>
        {src ? (
          <img src={src} alt={name || "User"} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-semibold">{getInitials(name)}</span>
        )}
      </div>
      {online !== undefined && (
        <span className={"absolute bottom-0 right-0 rounded-full border-2 border-white " + INDICATOR[size] + " " + (online ? "bg-emerald-500" : "bg-base-alt")} />
      )}
    </div>
  );
}
