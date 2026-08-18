// @ts-nocheck
"use client";
import { useState } from "react";

interface Tab { id: string; label: string; icon?: string; badge?: number; content: React.ReactNode; }

export function EntityTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id || "");
  const content = tabs.find(t => t.id === active)?.content;
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <nav className="flex overflow-x-auto border-b border-border scrollbar-none">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActive(tab.id)}
            className={"flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors " + (
              active === tab.id
                ? "border-amber-600 text-amber-700 bg-amber-50/50"
                : "border-transparent text-secondary hover:text-primary hover:bg-base-alt"
            )}>
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            {!!tab.badge && <span className="ml-1 px-1.5 py-0.5 bg-amber-600 text-white text-[10px] rounded-full font-bold">{tab.badge}</span>}
          </button>
        ))}
      </nav>
      <div className="p-5">{content}</div>
    </div>
  );
}
