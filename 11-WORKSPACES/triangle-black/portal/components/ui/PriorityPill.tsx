import { getPriority } from "@/lib/design-tokens";

interface Props {
  priority: string;
  size?: "sm" | "md";
}

export function PriorityPill({ priority, size = "sm" }: Props) {
  const p = getPriority(priority);
  const padding = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={`
      inline-flex items-center rounded-md font-bold border uppercase tracking-widest
      ${padding} ${p.bg} ${p.text} ${p.border}
    `}>
      {priority}
    </span>
  );
}
