// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobilePrimaryNav } from "./nav";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function MobileBottomBar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-4 gap-2">
        {mobilePrimaryNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-2xl px-3 py-3 text-center text-xs font-semibold transition",
                active
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-700",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
