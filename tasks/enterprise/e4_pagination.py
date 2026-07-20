# E4 — Add Pagination + Search Infrastructure
import os, json, datetime

LOG    = '/home/amr/AI-COMPANY-OS/tasks/logs/e4.log'
PORTAL = '/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal'
results = {'created':[], 'fixed':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

def write(path, content, label):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path,'w') as f: f.write(content)
    log('  CREATED: '+label)
    results['created'].append(label)

log('E4 START — Pagination + Search')

# Pagination component
pagination = '''// @ts-nocheck
"use client";

interface PaginationProps {
  page:       number;
  totalPages: number;
  onPage:     (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPage, className = "" }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600
          disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
      >
        ←
      </button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            p === page
              ? "bg-amber-600 border-amber-600 text-white font-semibold"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600
          disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
      >
        →
      </button>
    </div>
  );
}
'''
write(PORTAL+'/components/ui/Pagination.tsx', pagination, 'Pagination.tsx')

# usePagination hook
use_pagination = '''// @ts-nocheck
import { useState, useMemo } from "react";

export function usePagination<T>(
  items: T[],
  pageSize = 20
) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  function goToPage(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  // Reset to page 1 when items change significantly
  function reset() { setPage(1); }

  return {
    page,
    totalPages,
    pageSize,
    total:     items.length,
    items:     paginatedItems,
    goToPage,
    reset,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
'''
write(PORTAL+'/lib/hooks/usePagination.ts', use_pagination, 'hooks/usePagination.ts')

# useSearch hook
use_search = '''// @ts-nocheck
import { useState, useMemo } from "react";

export function useSearch<T extends Record<string, any>>(
  items: T[],
  searchFields: (keyof T)[]
) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item =>
      searchFields.some(field => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(q);
      })
    );
  }, [items, query, searchFields]);

  return {
    query,
    setQuery,
    filtered,
    total:     items.length,
    found:     filtered.length,
    hasQuery:  query.trim().length > 0,
    clear:     () => setQuery(""),
  };
}
'''
write(PORTAL+'/lib/hooks/useSearch.ts', use_search, 'hooks/useSearch.ts')

# Export new hooks
hooks_index = PORTAL + '/lib/hooks/index.ts'
with open(hooks_index) as f: hi = f.read()
new_exports = [
    "export { usePagination } from './usePagination';",
    "export { useSearch } from './useSearch';",
]
added = False
for exp in new_exports:
    if exp not in hi:
        hi += chr(10) + exp
        added = True
if added:
    with open(hooks_index,'w') as f: f.write(hi)
    log('  Updated hooks/index.ts')
    results['fixed'].append('hooks/index.ts updated')

# Export Pagination from components/ui
ui_index = PORTAL + '/components/ui/index.ts'
with open(ui_index) as f: ui = f.read()
if 'Pagination' not in ui:
    with open(ui_index,'a') as f:
        f.write(chr(10)+"export { Pagination } from './Pagination';")
    log('  Added Pagination to ui/index.ts')
    results['fixed'].append('Pagination exported')

log('='*40)
log('E4 COMPLETE — Created: '+str(len(results['created'])))
for c in results['created']: log('  OK '+c)
with open('/home/amr/AI-COMPANY-OS/tasks/logs/e4_result.json','w') as f:
    json.dump(results,f,indent=2)