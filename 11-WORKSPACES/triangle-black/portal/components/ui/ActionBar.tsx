// @ts-nocheck
"use client";
import { ReactNode } from "react";
import { SearchInput } from "@/components/ui";
import { ExportButton } from "@/components/ui/ExportButton";

interface ActionBarProps {
  search?:       { value: string; onChange: (v: string) => void; placeholder?: string };
  export?:       { data: any[]; filename: string; title: string };
  filters?:      ReactNode;
  actions?:      ReactNode;
  resultCount?:  number;
  totalCount?:   number;
}

export function ActionBar({
  search, export: exp, filters, actions, resultCount, totalCount,
}: ActionBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-3 flex-wrap">
        {search && (
          <SearchInput
            value={search.value}
            onChange={e => search.onChange(e.target.value)}
            placeholder={search.placeholder || "Search..."}
            className="w-full sm:w-72"
          />
        )}
        {filters && <div className="flex items-center gap-2">{filters}</div>}
        <div className="ml-auto flex items-center gap-2">
          {resultCount !== undefined && (
            <span className="text-xs text-slate-500">
              {resultCount}{totalCount ? ` of ${totalCount}` : ""} results
            </span>
          )}
          {exp && <ExportButton data={exp.data} filename={exp.filename} title={exp.title} />}
          {actions}
        </div>
      </div>
    </div>
  );
}
