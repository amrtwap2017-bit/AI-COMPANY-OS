// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { enterpriseCenters, legacyLinks } from "./nav";
import { BrandMark } from "./BrandMark";

type MobileCenterDrawerProps = {
  open: boolean;
  onClose: () => void;
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function MobileCenterDrawer({ open, onClose }: MobileCenterDrawerProps) {
  const pathname = usePathname();

  return (
    <div
      className={[
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-0 bg-slate-950/50 transition",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      <div
        className={[
          "absolute left-0 top-0 h-full w-[88vw] max-w-sm bg-slate-950 text-slate-100 shadow-2xl transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="border-b border-slate-800 px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <BrandMark />
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-800 px-3 py-2 text-sm text-slate-300"
            >
              Close
            </button>
          </div>
        </div>

        <div className="h-[calc(100%-88px)] overflow-y-auto px-4 py-4">
          <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            Business Centers
          </div>

          <div className="space-y-2">
            {enterpriseCenters.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={onClose}
                  className={[
                    "block rounded-2xl border px-4 py-4 transition",
                    active
                      ? "border-amber-400/70 bg-slate-900"
                      : "border-slate-800 bg-slate-900/40",
                  ].join(" ")}
                >
                  <div className="text-base font-semibold">{item.label}</div>
                  <div className="mt-2 text-sm text-tertiary">{item.subtitle}</div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8">
            <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Legacy Navigation
            </div>
            <div className="space-y-1">
              {legacyLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="block rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
