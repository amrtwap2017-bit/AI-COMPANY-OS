// @ts-nocheck
import Link from "next/link";
import { ChevronRight } from "lucide-react";
interface Crumb { label: string; href?: string }
interface Props { items: Crumb[] }
export function Breadcrumb({ items }: Props) {
  return (
    <nav className="flex items-center gap-1.5 text-sm mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
          {item.href && i < items.length - 1
            ? <Link href={item.href} className="text-slate-500 hover:text-amber-700 transition-colors">{item.label}</Link>
            : <span className={i === items.length - 1 ? "text-slate-900 font-medium" : "text-slate-500"}>{item.label}</span>
          }
        </span>
      ))}
    </nav>
  );
}
