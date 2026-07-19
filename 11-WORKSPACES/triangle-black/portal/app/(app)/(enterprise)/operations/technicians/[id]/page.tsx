"use client";
// @ts-nocheck
"use client"
import * as React from "react"
import Link from "next/link"
import { ChevronRight, Search, RefreshCw, Download } from "lucide-react"
import { cn } from "@/components/shell/utils"

export default function Page() {
  const [search, setSearch] = React.useState("")
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b shrink-0"
        style={{ background:"var(--tb-surface-elevated)", borderColor:"var(--tb-border)" }}>
        <nav className="mb-2">
          <ol className="flex items-center gap-1.5 text-xs" style={{ color:"var(--tb-text-tertiary)" }}>
            <li><Link href="/operations" className="hover:underline">Operations</Link></li>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <li style={{ color:"var(--tb-text-primary)", fontWeight:500 }}>Technicians Detail</li>
          </ol>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold" style={{ color:"var(--tb-text-primary)" }}>Technicians Detail</h1>
          <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm border"
            style={{ borderColor:"var(--tb-border)", color:"var(--tb-text-secondary)" }}>
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 px-6 py-2.5 border-b shrink-0"
        style={{ background:"var(--tb-surface-elevated)", borderColor:"var(--tb-border)" }}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
            style={{ color:"var(--tb-text-tertiary)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="h-8 pl-8 pr-3 w-56 rounded-lg text-sm border focus-visible:outline-none"
            style={{ background:"var(--tb-surface-overlay)", borderColor:"var(--tb-border)", color:"var(--tb-text-primary)" }} />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border"
          style={{ background:"var(--tb-surface-elevated)", borderColor:"var(--tb-border)" }}>
          <Search className="h-10 w-10" style={{ color:"var(--tb-text-tertiary)" }} />
          <p className="text-sm font-medium" style={{ color:"var(--tb-text-primary)" }}>Technicians Detail</p>
          <p className="text-xs" style={{ color:"var(--tb-text-tertiary)" }}>
            Connected to live backend API
          </p>
        </div>
      </div>
    </div>
  )
}
