"use client";
// @ts-nocheck
// Triangle Black - Pagination
// UI-032: Added per-page selector, total display

interface PaginationProps {
  page:         number;
  totalPages:   number;
  onPage:       (page: number) => void;
  total?:       number;
  pageSize?:    number;
  onPageSize?:  (size: number) => void;
  pageSizes?:   number[];
  className?:   string;
}

export function Pagination({
  page, totalPages, onPage, total, pageSize = 20, onPageSize,
  pageSizes = [10, 20, 50, 100], className = ""
}: PaginationProps) {
  if (totalPages <= 1 && !onPageSize) return null;

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)       return [1, 2, 3, 4, 5, 0, totalPages];
    if (page >= totalPages - 3) return [1, 0, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, 0, page - 1, page, page + 1, 0, totalPages];
  };

  return (
    <div className={"flex items-center justify-between flex-wrap gap-3 " + className}>
      <div className="flex items-center gap-2">
        {total !== undefined && (
          <span className="text-xs text-secondary">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </span>
        )}
        {onPageSize && (
          <select
            value={pageSize}
            onChange={e => { onPageSize(Number(e.target.value)); onPage(1); }}
            className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
          >
            {pageSizes.map(s => (
              <option key={s} value={s}>{s} per page</option>
            ))}
          </select>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPage(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
            className="px-3 py-1.5 text-sm rounded-lg border border-stone-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >←</button>

          {getPages().map((p, i) =>
            p === 0 ? (
              <span key={"ellipsis-" + i} className="px-2 text-slate-300">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p)}
                aria-label={"Page " + p}
                aria-current={p === page ? "page" : undefined}
                className={"px-3 py-1.5 text-sm rounded-lg border transition-colors " + (p === page ? "bg-amber-600 border-amber-600 text-white font-semibold" : "border-stone-200 text-slate-600 hover:bg-slate-50")}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onPage(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
            className="px-3 py-1.5 text-sm rounded-lg border border-stone-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >→</button>
        </div>
      )}
    </div>
  );
}
