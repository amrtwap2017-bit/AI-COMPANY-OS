import { getStatus } from "@/lib/design-tokens";

interface Props {
  status: string;
  dot?: boolean;
  size?: "sm" | "md";
}

export function StatusPill({ status, dot = true, size = "sm" }: Props) {
  const s = getStatus(status);
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  const label = (status || "unknown").replace(/_/g, " ");

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-md font-semibold border tracking-wide
      ${padding} ${s.bg} ${s.text} ${s.border}
    `}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      )}
      {label}
    </span>
  );
}
