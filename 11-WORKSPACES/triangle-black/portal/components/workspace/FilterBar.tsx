// @ts-nocheck
"use client";

import { useState } from "react";

type FilterOption = {
  label: string;
  value: string;
};

type FilterGroup = {
  title: string;
  options: FilterOption[];
};

type FilterBarProps = {
  title: string;
  subtitle: string;
  groups: FilterGroup[];
};

export function FilterBar({ title, subtitle, groups }: FilterBarProps) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  function toggle(group: string, value: string) {
    setSelected((prev) => ({
      ...prev,
      [group]: prev[group] === value ? "" : value,
    }));
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 space-y-5">
        {groups.map((group) => (
          <div key={group.title}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {group.title}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.options.map((option) => {
                const active = selected[group.title] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggle(group.title, option.value)}
                    className={[
                      "rounded-full border px-3 py-2 text-xs font-medium transition",
                      active
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
