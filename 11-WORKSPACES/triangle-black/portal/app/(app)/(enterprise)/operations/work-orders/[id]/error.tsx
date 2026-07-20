// @ts-nocheck
// Triangle Black - Error Boundary
// TB-002: Removed Breadcrumb (cannot use hooks in error.tsx)
"use client";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error, reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[TB Error]", error?.message); }, [error]);
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {error?.message || "An unexpected error occurred."}
          </p>
          {error?.digest && (
            <p className="text-xs text-slate-400 mb-5 font-mono bg-slate-50 px-3 py-1.5 rounded-lg">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex items-center gap-3 justify-center">
            <button onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition-colors">
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <a href="/workspace"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">
              <Home className="w-4 h-4" /> Go Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
