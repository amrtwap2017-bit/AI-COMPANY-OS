"use client";
// @ts-nocheck
// Triangle Black — Loading Skeletons v2.0
// Uses tb-skeleton CSS animation from globals.css
const SkeletonBlock = ({ className = "" }) => (
  <div className={`tb-skeleton bg-base-alt rounded ${className}`} />
);

export function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-3`}
      style={{ gridTemplateColumns: `repeat(${Math.min(count, 4)}, 1fr)` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-2xl p-5 space-y-3">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-8 w-16" />
          <SkeletonBlock className="h-2.5 w-32" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="bg-base-alt px-5 py-3 flex gap-6">
        {[40, 20, 20, 15].map((w: any, i: number) => (
          <SkeletonBlock key={i} className="h-3 rounded" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="divide-y divide-divider">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-6">
            <SkeletonBlock className="h-4 flex-1" />
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-6 w-16 rounded-lg" />
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
        <div key={i} className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <SkeletonBlock className="h-8 w-8 rounded-xl" />
          <SkeletonBlock className="h-5 w-3/4" />
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="tb-page">
      {/* Header skeleton */}
      <div className="space-y-2">
        <SkeletonBlock className="h-2.5 w-20" />
        <SkeletonBlock className="h-8 w-64" />
        <SkeletonBlock className="h-4 w-96" />
      </div>
      <KpiSkeleton count={4} />
      <TableSkeleton rows={5} />
    </div>
  );
}
