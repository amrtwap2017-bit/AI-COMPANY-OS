"use client";
// @ts-nocheck
import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/operations/work-orders", icon: "🔧", label: "Work Orders" },
  { href: "/operations/service-requests", icon: "🎫", label: "Requests" },
  { href: "/supply-chain/invoices", icon: "📄", label: "Invoices" },
  { href: "/reports", icon: "📊", label: "Reports" },
  { href: "/executive/dashboard", icon: "📈", label: "Dashboard" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border"
         style={{background:"#0F172A",paddingBottom:"env(safe-area-inset-bottom)"}}>
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item: any) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors"
              style={{color: active ? "#34D399" : "#64748B"}}>
              <span style={{fontSize:"1.25rem",lineHeight:1}}>{item.icon}</span>
              <span style={{fontSize:"0.55rem",fontWeight:active?700:500}}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
