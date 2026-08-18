"use client";
// @ts-nocheck
// Triangle Black - Status Filter Tabs
// UI-044: Standard filter tab pattern used across all list pages

interface FilterTab {
  value: string;
  label: string;
  count?: number;
}

interface StatusFilterTabsProps {
  tabs:      FilterTab[];
  active:    string;
  onChange:  (value: string) => void;
  className?: string;
}

export function StatusFilterTabs({ tabs, active, onChange, className = "" }: StatusFilterTabsProps) {
  return (
    <div className={"flex items-center gap-1 flex-wrap " + className} role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={active === tab.value}
          onClick={() => onChange(tab.value)}
          className={
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all " +
            (active === tab.value
              ? "bg-amber-600 text-white shadow-sm"
              : "text-secondary hover:text-primary hover:bg-surface-alt")
          }
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={
              "px-1.5 py-0.5 rounded-full text-[9px] font-bold " +
              (active === tab.value ? "bg-white/25 text-white" : "bg-surface-alt text-secondary")
            }>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
