"use client";
// @ts-nocheck
// Triangle Black - DataTable
// UI-031: Sticky header, improved empty/loading states
import { ReactNode, useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface Column<T> {
  key:       string;
  label:     string;
  render?:   (row: T) => ReactNode;
  align?:    "left" | "center" | "right";
  width?:    string;
  sortable?: boolean;
}

interface Props<T> {
  columns:   Column<T>[];
  data:      T[];
  loading?:  boolean;
  empty?:    string;
  onRow?:    (row: T) => void;
  keyField?: string;
  stickyHeader?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns, data, loading, empty = "No records found", onRow,
  keyField = "id", stickyHeader = false,
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      })
    : data;

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className={"border-b " + (stickyHeader ? "sticky top-0 z-10" : "")}>
              {columns.map(col => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={
                    "px-4 py-3 text-[11px] font-semibold text-secondary uppercase tracking-wider " +
                    (col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left") +
                    (col.sortable ? " cursor-pointer select-none hover:opacity-80 transition-colors" : "")
                  }
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      sortKey === col.key
                        ? sortDir === "asc"
                          ? <ChevronUp className="w-3 h-3 text-brand" />
                          : <ChevronDown className="w-3 h-3 text-brand" />
                        : <ChevronsUpDown className="w-3 h-3 text-tertiary" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className={"border-b border-divider " + (i % 2 === 0 ? "bg-white" : "/40")}>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3.5">
                    <div className="skeleton h-3.5 rounded" style={{ width: (50 + (i * 13) % 40) + "%" }} />
                  </td>
                ))}
              </tr>
            ))}
            {!loading && sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-20">
                  <div className="text-3xl mb-3 opacity-30">📭</div>
                  <div className="text-sm font-medium text-tertiary">{empty}</div>
                </td>
              </tr>
            )}
            {!loading && sorted.map((row, idx) => (
              <tr
                key={row[keyField] ?? idx}
                onClick={() => onRow?.(row)}
                className={
                  "border-b border-divider text-sm transition-colors " +
                  (idx % 2 === 0 ? "bg-white" : "/40") +
                  (onRow ? " cursor-pointer hover:bg-amber-50/60" : " hover:")
                }
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={
                      "px-4 py-3.5 text-primary " +
                      (col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "")
                    }
                  >
                    {col.render ? col.render(row) : (row[col.key] ?? <span className="text-tertiary">—</span>)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
