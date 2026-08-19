"use client";
// @ts-nocheck
// Triangle Black - Center Sub-Navigation
// Renders horizontal tab bar for center sub-pages
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SubNavItem {
  label: string;
  href:  string;
}

interface CenterSubNavProps {
  items: SubNavItem[];
}

export function CenterSubNav({ items }: CenterSubNavProps) {
  const pathname = usePathname();
  if (!items || items.length === 0) return null;
  return (
    <div className="border-b border-border bg-white sticky top-14 z-20 flex-shrink-0">
      <div className="px-4 sm:px-6 flex items-end gap-0 overflow-x-auto scrollbar-none">
        {items.map((item: any) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "whitespace-nowrap px-3.5 py-3 text-sm font-medium border-b-2 transition-all " +
                (active
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-secondary hover:text-primary hover:border-border")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
