"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, FileText, UserCheck,
  BarChart3, LogOut, Building2, ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard, roles: ["admin","manager","agent"] },
  { href: "/leads",     label: "Leads",      icon: Users,           roles: ["admin","manager","agent"] },
  { href: "/quotes",    label: "Quotes",      icon: FileText,        roles: ["admin","manager","agent"] },
  { href: "/agents",    label: "Agents",      icon: UserCheck,       roles: ["admin","manager"] },
  { href: "/reports",   label: "Reports",     icon: BarChart3,       roles: ["admin","manager"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const visible = navItems.filter((n) =>
    user && n.roles.includes(user.role)
  );

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 bg-[#1B2B4B] flex flex-col z-40"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-[#F59E0B] rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">Triangle Black</p>
          <p className="text-white/50 text-xs">Engineering Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Sidebar">
        {visible.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                "transition-colors duration-150 group",
                active
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 py-2 mb-2">
          <p className="text-white text-sm font-medium truncate">{user?.name}</p>
          <p className="text-white/50 text-xs capitalize">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium",
            "text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          )}
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
