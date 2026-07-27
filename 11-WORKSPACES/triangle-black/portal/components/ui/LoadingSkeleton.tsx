"use client";
// @ts-nocheck
// Triangle Black — Loading Skeleton Screens

export function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${Math.min(count, 4)} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-3" />
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2" />
          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-32" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
      <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 flex gap-6">
        {[40, 20, 20, 15].map((w, i) => (
          <div key={i} className={`h-3 bg-slate-200 dark:bg-slate-700 rounded`} style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="divide-y divide-slate-50 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-6">
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded flex-1" />
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-20" />
            <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full mb-1" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="animate-pulse">
        <div className="h-3 bg-amber-200 rounded w-20 mb-2" />
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-2" />
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-96" />
      </div>
      <KpiSkeleton count={4} />
      <TableSkeleton rows={5} />
    </div>
  );
}
