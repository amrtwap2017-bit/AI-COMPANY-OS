// @ts-nocheck
export default function Loading() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-[var(--color-surface)] rounded w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3].map(i=>(<div key={i} className="h-32 bg-[var(--color-surface)] rounded-xl" />))}
      </div>
      <div className="space-y-3">
        {[1,2,3,4,5].map(i=>(<div key={i} className="h-12 bg-[var(--color-surface)] rounded" />))}
      </div>
    </div>
  );
}
