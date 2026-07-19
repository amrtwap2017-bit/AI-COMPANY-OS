"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MessageSquare, Bot, BookOpen,
  Workflow, Brain, BarChart3, Rocket, Activity,
  User, Key, LogOut, Settings,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/",            label: "Overview",    icon: LayoutDashboard },
  { href: "/chat",        label: "Chat",        icon: MessageSquare, badge: "AI" },
  { href: "/agents",      label: "Agents",      icon: Bot },
  { href: "/projects",    label: "Projects",    icon: Rocket },
  { href: "/workflows",   label: "Workflows",   icon: Workflow },
  { href: "/memory",      label: "Memory",      icon: Brain },
  { href: "/reflections", label: "Reflections", icon: Activity },
  { href: "/analytics",   label: "Analytics",   icon: BarChart3 },
  { href: "/knowledge",   label: "Knowledge",   icon: BookOpen },
];

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar() {
  const path     = usePathname();
  const { user, logout, loading } = useAuth();

  // Don't show sidebar on auth pages
  if (path === "/login" || path === "/register") return null;

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col h-full flex-shrink-0">

      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-white">AI Company OS</p>
            <p className="text-xs text-gray-500">Persistent Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, badge }: any) => {
          const active = path === href;
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        {loading ? (
          <div className="h-8 bg-gray-800 rounded animate-pulse" />
        ) : user ? (
          <>
            <Link href="/profile"
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                path === "/profile"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <User className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{user.username}</p>
                <p className="text-xs opacity-60 truncate">{user.role}</p>
              </div>
            </Link>
            <button onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                         text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </>
        ) : (
          <Link href="/login"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                       text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <User className="w-4 h-4" />
            Sign in
          </Link>
        )}
      </div>

    </aside>
  );
}
