// @ts-nocheck
import { ReactNode } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

interface FilterOption { label: string; value: string }

interface Props {
  search?: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  };
  filters?: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (v: string) => void;
  }[];
  actions?: ReactNode;
  count?: number;
}

export function FilterBar({ search, filters, actions, count }: Props) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {search && (
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tertiary pointer-events-none" />
          <input
            value={search.value}
            onChange={e => search.onChange(e.target.value)}
            placeholder={search.placeholder || "Search..."}
            className="w-full pl-9 pr-4 py-2 text-sm bg-surface border border-border rounded-xl
              focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400
              placeholder-slate-400 transition-all"
          />
        </div>
      )}

      {filters && filters.length > 0 && (
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-tertiary flex-shrink-0" />
          {filters.map(f => (
            <select
              key={f.label}
              value={f.value}
              onChange={e => f.onChange(e.target.value)}
              className="text-xs bg-surface border border-border rounded-xl px-3 py-2
                focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400
                text-secondary font-medium cursor-pointer"
            >
              <option value="">{f.label}: All</option>
              {f.options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ))}
        </div>
      )}

      {count !== undefined && (
        <span className="text-xs text-tertiary tabular-nums">
          {count.toLocaleString()} result{count !== 1 ? "s" : ""}
        </span>
      )}

      {actions && (
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
