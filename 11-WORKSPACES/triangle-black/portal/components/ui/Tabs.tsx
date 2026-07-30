// @ts-nocheck
// Triangle Black - Tabs Component
// UI-023: Center sub-navigation and page-level tabs
"use client";
import { ReactNode } from "react";

interface Tab {
  key:      string;
  label:    string;
  count?:   number;
  icon?:    ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs:      Tab[];
  active:    string;
  onChange:  (key: string) => void;
  variant?:  "underline" | "pill" | "enclosed";
  size?:     "sm" | "md";
  className?: string;
}

export function Tabs({ tabs, active, onChange, variant = "underline", size = "md", className = "" }: TabsProps) {
  const sizeClass = size === "sm" ? "text-xs px-2.5 py-1.5 gap-1.5" : "text-sm px-3.5 py-2 gap-2";

  if (variant === "pill") {
    return (
      <div className={"flex items-center gap-1 flex-wrap " + className} role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active === tab.key}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.key)}
            className={["inline-flex items-center rounded-xl font-semibold transition-all", sizeClass,
              active === tab.key
                ? "bg-amber-600 text-white shadow-sm"
                : "text-secondary hover:text-slate-700 hover:bg-slate-100",
              tab.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
            ].join(" ")}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className={"ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold " + (active === tab.key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600")}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={"border-b border-stone-200 " + className} role="tablist">
      <div className="flex items-end gap-0 -mb-px overflow-x-auto scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active === tab.key}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.key)}
            className={["inline-flex items-center border-b-2 font-medium transition-all whitespace-nowrap", sizeClass,
              active === tab.key
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-secondary hover:text-slate-700 hover:border-slate-300",
              tab.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
            ].join(" ")}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className={"ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold " + (active === tab.key ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-secondary")}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
