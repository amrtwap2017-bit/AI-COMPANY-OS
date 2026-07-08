"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/auth-context";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Shield, LayoutDashboard, Users, UserCheck,
  FileCheck, Settings, LogOut, Webhook, ChevronRight,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/users",     label: "Users",      icon: Users },
  { href: "/agents",    label: "Agents",     icon: UserCheck },
  { href: "/contracts", label: "Contracts",  icon: FileCheck },
  { href: "/system",    label: "System",     icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (!isLoading && user && !["admin","manager"].includes(user.role)) {
      logout();
    }
  }, [user, isLoading, router, logout]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div role="status" className="text-center">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading admin portal...</p>
      </div>
    </div>
  );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#1e1b4b] flex flex-col z-40"
        aria-label="Admin navigation">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-[#7C3AED] rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Triangle Black</p>
            <p className="text-white/50 text-xs">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Sidebar">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
                )}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 py-2 mb-2">
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <p className="text-white/50 text-xs capitalize">{user.role}</p>
          </div>
          <button onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm
              text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Sign out">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <main id="main-content" className="ml-64 flex-1 p-8" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
