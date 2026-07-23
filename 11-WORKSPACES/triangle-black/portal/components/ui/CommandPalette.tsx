"use client"; // @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { Search, X, Loader2 } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  work_orders:     "bg-blue-100 text-blue-700",
  assets:          "bg-emerald-100 text-emerald-700",
  leads:           "bg-purple-100 text-purple-700",
  contracts:       "bg-amber-100 text-amber-700",
  inventory_items: "bg-orange-100 text-orange-700",
  technicians:     "bg-cyan-100 text-cyan-700",
  projects:        "bg-indigo-100 text-indigo-700",
  hotels:          "bg-rose-100 text-rose-700",
};

interface SearchResult {
  type: string; id: string; label: string; meta: string; url: string;
}

interface Props { isOpen: boolean; onClose: () => void; }

export function CommandPalette({ isOpen, onClose }: Props) {
  const [query, setQuery]     = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef              = useRef<HTMLInputElement>(null);
  const router                = useRouter();

  const { data, isFetching } = useQuery({
    queryKey: ["cmd-search", query],
    queryFn: () => authFetch(`/api/v1/search/quick?q=${encodeURIComponent(query)}`).then(r => r.json()),
    enabled: query.length >= 2,
    staleTime: 5000,
  });

  const results: SearchResult[] = data?.results ?? [];

  useEffect(() => {
    if (isOpen) { setQuery(""); setSelected(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") { onClose(); }
      if (e.key === "ArrowDown") setSelected(s => Math.min(s + 1, results.length - 1));
      if (e.key === "ArrowUp")   setSelected(s => Math.max(s - 1, 0));
      if (e.key === "Enter" && results[selected]) {
        router.push(results[selected].url); onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, results, selected, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"
         onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Search work orders, assets, leads, contracts..."
            className="flex-1 outline-none text-sm text-slate-800 placeholder-slate-400"
          />
          {isFetching && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {results.length > 0 ? results.map((r, i) => (
            <div
              key={r.id}
              onClick={() => { router.push(r.url); onClose(); }}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-slate-50
                ${i === selected ? "bg-blue-50" : "hover:bg-slate-50"}`}
            >
              <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0
                ${TYPE_COLORS[r.type] ?? "bg-gray-100 text-gray-600"}`}>
                {r.type.replace(/_/g," ")}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{r.label}</div>
                {r.meta && <div className="text-xs text-slate-400 truncate">{r.meta}</div>}
              </div>
            </div>
          )) : query.length >= 2 && !isFetching ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              No results for "{query}"
            </div>
          ) : query.length < 2 ? (
            <div className="px-4 py-6 text-center text-xs text-slate-400">
              Type at least 2 characters to search across all entities
            </div>
          ) : null}
        </div>

        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex gap-4 text-xs text-slate-400">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
