// @ts-nocheck
"use client";

import { useState } from "react";

type EntityTab = {
  key: string;
  label: string;
  description: string;
};

type EntityDetailTabsProps = {
  title: string;
  subtitle: string;
  tabs: EntityTab[];
};

export function EntityDetailTabs({ title, subtitle, tabs }: EntityDetailTabsProps) {
  const [active, setActive] = useState(tabs[0]?.key || "");

  const current = tabs.find((tab) => tab.key === active) || tabs[0];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const selected = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={[
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                selected
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {current ? (
        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">{current.label}</div>
          <div className="mt-2 text-sm leading-6 text-slate-600">{current.description}</div>
        </div>
      ) : null}
    </section>
  );
}
