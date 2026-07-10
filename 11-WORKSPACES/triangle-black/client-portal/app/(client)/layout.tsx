"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useClientAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  Building2, LayoutDashboard, FileText,
  Activity, LogOut, FileCheck, Receipt,
} from "lucide-react";

const nav = [
  { href: "/dashboard",  label: "Overview",   icon: LayoutDashboard },
  { href: "/quotes",     label: "Proposals",  icon: FileText        },
  { href: "/contracts",  label: "Contracts",  icon: FileCheck       },
  { href: "/invoices",   label: "Invoices",   icon: Receipt         },
  { href: "/activities", label: "History",    icon: Activity        },
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useClientAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div role="status" aria-live="polite" className="text-center">
          <div className="w-10 h-10 border-4 border-[#1B2B4B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading your portal...</p>
        </div>
      </div>
    );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1B2B4B] shadow-lg" role="banner">
        <div className="max-w-6xl mx-auto px-6 py-0">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F59E0B] rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">
                  Triangle Black
                </p>
                <p className="text-white/50 text-xs">Client Portal</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {nav.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        active
                          ? "bg-white/15 text-white"
                          : "text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <item.icon className="w-4 h-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User + Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-white text-sm font-medium">{user.name}</p>
                <p className="text-white/50 text-xs">{user.email}</p>
              </div>
              <button
                onClick={logout}
                aria-label="Sign out"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span className="hidden md:inline">Sign out</span>
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          <nav
            className="md:hidden flex gap-1 pb-2"
            aria-label="Mobile navigation"
          >
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${active ? "bg-white/15 text-white" : "text-white/60 hover:text-white"}`}
                >
                  <item.icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        className="max-w-6xl mx-auto px-6 py-8"
        tabIndex={-1}
      >
        {children}
      </main>

      <footer className="text-center text-xs text-gray-400 py-6 mt-8 border-t border-gray-200">
        © 2025 Triangle Black Engineering Platform · All rights reserved
      </footer>
    </div>
  );
}
