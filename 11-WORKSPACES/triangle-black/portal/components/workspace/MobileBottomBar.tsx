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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
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
                  ? "bg-sidebar text-white"
                  : "bg-surface-alt text-primary",
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
