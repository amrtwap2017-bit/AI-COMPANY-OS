"use client";
// @ts-nocheck
// Triangle Black - ActionBar
// UI-036: Added view toggle (table/grid)
import { ReactNode } from "react";
import { SearchInput } from "@/components/ui/SearchInput";
import { ExportButton } from "@/components/ui/ExportButton";
import { LayoutGrid, List } from "lucide-react";

interface ActionBarProps {
  search?:      { value: string; onChange: (v: string) => void; placeholder?: string };
  export?:      { data: any[]; filename: string; title: string };
  filters?:     ReactNode;
  actions?:     ReactNode;
  resultCount?: number;
  totalCount?:  number;
  view?:        "table" | "grid";
  onView?:      (v: "table" | "grid") => void;
}

export function ActionBar({
  search, export: exp, filters, actions,
  resultCount, totalCount, view, onView,
}: ActionBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
      <div className="flex items-center gap-3 flex-wrap">
        {search && (
          <SearchInput
            value={search.value}
            onChange={e => search.onChange(e.target.value)}
            onClear={search.value ? () => search.onChange("") : undefined}
            placeholder={search.placeholder || "Search..."}
            className="w-full sm:w-72"
          />
        )}
        {filters && <div className="flex items-center gap-2">{filters}</div>}
        <div className="ml-auto flex items-center gap-2">
          {resultCount !== undefined && (
            <span className="text-xs text-tertiary">
              {resultCount}{totalCount !== undefined ? " of " + totalCount : ""} results
            </span>
          )}
          {onView && (
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => onView("table")}
                className={"p-1.5 transition-colors " + (view === "table" ? "bg-slate-900 text-white" : "text-tertiary hover:bg-slate-50")}
                aria-label="Table view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onView("grid")}
                className={"p-1.5 transition-colors " + (view === "grid" ? "bg-slate-900 text-white" : "text-tertiary hover:bg-slate-50")}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {exp && <ExportButton data={exp.data} filename={exp.filename} title={exp.title} />}
          {actions}
        </div>
      </div>
    </div>
  );
}
