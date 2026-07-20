// @ts-nocheck
import * as React from 'react'
function Sk({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[var(--tb-surface-overlay)] ${className}`} aria-hidden="true" />
}
export function SkeletonPage() {
  return (
    <div className="flex flex-col h-full" aria-busy="true" aria-label="Loading...">
      <div className="px-6 py-4 border-b space-y-3"
        style={{ background:'var(--tb-surface-elevated)', borderColor:'var(--tb-border)' }}>
        <Sk className="h-3 w-32" />
        <Sk className="h-6 w-56" />
        <Sk className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-4 gap-4 p-6 pb-4">
        {[...Array(4)].map((_,i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3"
            style={{ background:'var(--tb-surface-elevated)', borderColor:'var(--tb-border)' }}>
            <Sk className="h-3 w-24" /><Sk className="h-7 w-20" /><Sk className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="mx-6 rounded-xl border overflow-hidden"
        style={{ background:'var(--tb-surface-elevated)', borderColor:'var(--tb-border)' }}>
        <div className="flex gap-4 px-4 py-3 border-b"
          style={{ background:'var(--tb-surface-overlay)', borderColor:'var(--tb-border)' }}>
          <Sk className="h-4 w-32" />
        </div>
        {[...Array(6)].map((_,i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b last:border-0"
            style={{ borderColor:'var(--tb-border)', opacity: 1 - i * 0.12 }}>
            <Sk className="h-4 w-4 rounded" />
            <Sk className="h-4 flex-[2]" />
            <Sk className="h-6 w-20 rounded-full" />
            <Sk className="h-4 flex-1" />
            <Sk className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
export function SkeletonDetailPage() {
  return (
    <div className="flex flex-col h-full" aria-busy="true">
      <div className="px-6 py-4 border-b space-y-2"
        style={{ background:'var(--tb-surface-elevated)', borderColor:'var(--tb-border)' }}>
        <Sk className="h-3 w-32" />
        <div className="flex items-center gap-3"><Sk className="h-7 w-48" /><Sk className="h-6 w-20 rounded-full" /></div>
        <div className="flex gap-4">{[...Array(4)].map((_,i) => <Sk key={i} className="h-8 w-24" />)}</div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-6 space-y-4">
          {[...Array(3)].map((_,i) => (
            <div key={i} className="rounded-xl border p-5 space-y-3"
              style={{ background:'var(--tb-surface-elevated)', borderColor:'var(--tb-border)' }}>
              <Sk className="h-5 w-32" />
              <div className="grid grid-cols-3 gap-4">
                {[...Array(6)].map((_,j) => <div key={j} className="space-y-1.5"><Sk className="h-3 w-20" /><Sk className="h-4 w-28" /></div>)}
              </div>
            </div>
          ))}
        </div>
        <div className="w-64 border-l p-4 space-y-3" style={{ borderColor:'var(--tb-border)' }}>
          {[...Array(5)].map((_,i) => <Sk key={i} className="h-10 rounded-lg" />)}
        </div>
      </div>
    </div>
  )
}
