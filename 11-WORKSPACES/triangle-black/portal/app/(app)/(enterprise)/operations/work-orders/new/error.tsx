"use client"
import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
export default function Error({ error, reset }: any) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
        style={{ background:"var(--tb-danger-bg)", color:"var(--tb-danger-icon)" }}>
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="text-lg font-semibold" style={{ color:"var(--tb-text-primary)" }}>Failed to load form</h2>
      <button onClick={reset}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border"
        style={{ background:"var(--tb-surface-elevated)", borderColor:"var(--tb-border)", color:"var(--tb-text-primary)" }}>
        <RefreshCw className="h-4 w-4" /> Retry
      </button>
    </div>
  )
}
