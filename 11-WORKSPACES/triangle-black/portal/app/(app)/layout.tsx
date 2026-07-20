// @ts-nocheck
"use client";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/ui/MobileNav";
import { Menu } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Mobile header */}
      <MobileNav />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-3
          bg-white border-b border-slate-200 shrink-0">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex-1" />
          <span className="text-xs text-slate-400">Triangle Black Platform v2.6.0</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
