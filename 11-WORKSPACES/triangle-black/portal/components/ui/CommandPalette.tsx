"use client";
// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { Search, X, Loader2 } from "lucide-react";

interface SearchResult {
  type: string;
  id: string;
  label: string;
  meta: string;
  url: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const TYPE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  work_orders:     { bg: "rgba(91,124,140,0.10)", color: "#5B7C8C", border: "rgba(91,124,140,0.22)" },
  assets:          { bg: "rgba(84,124,77,0.10)", color: "#547C4D", border: "rgba(84,124,77,0.22)" },
  leads:           { bg: "rgba(141,116,67,0.10)", color: "#8D7443", border: "rgba(141,116,67,0.22)" },
  contracts:       { bg: "rgba(185,146,76,0.10)", color: "#B9924C", border: "rgba(185,146,76,0.22)" },
  inventory_items: { bg: "rgba(176,122,42,0.10)", color: "#B07A2A", border: "rgba(176,122,42,0.22)" },
  technicians:     { bg: "rgba(84,124,77,0.08)", color: "#547C4D", border: "rgba(84,124,77,0.18)" },
  projects:        { bg: "rgba(109,95,83,0.10)", color: "#6D5F53", border: "rgba(109,95,83,0.22)" },
  hotels:          { bg: "rgba(168,74,61,0.10)", color: "#A84A3D", border: "rgba(168,74,61,0.22)" },
};

export function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { data, isFetching } = useQuery({
    queryKey: ["cmd-search", query],
    queryFn: () => authFetch(`/api/v1/search/quick?q=${encodeURIComponent(query)}`).then(r => r.data ?? r),
    enabled: open && query.length >= 2,
    staleTime: 5000,
  });

  const results: SearchResult[] = data?.results ?? [];

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") setSelected(s => Math.min(s + 1, Math.max(results.length - 1, 0)));
      if (e.key === "ArrowUp") setSelected(s => Math.max(s - 1, 0));
      if (e.key === "Enter" && results[selected]) {
        router.push(results[selected].url);
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, selected, router, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center pt-20"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 overflow-hidden rounded-2xl"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        }}
        onClick={(e: any) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface-alt)" }}
        >
          <Search className="w-5 h-5 flex-shrink-0" style={{ color: "var(--color-text-3)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e: any) => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Search work orders, assets, contracts, technicians..."
            className="flex-1 outline-none text-sm"
            style={{ color: "var(--color-text-1)", background: "transparent" }}
          />
          {isFetching && <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--color-text-3)" }} />}
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: "var(--color-text-3)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {query.length < 2 ? (
            <div className="px-4 py-8 text-center" style={{ color: "var(--color-text-3)" }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: 4 }}>Global Search</div>
              <div style={{ fontSize: "0.75rem" }}>Type at least 2 characters to search the platform</div>
            </div>
          ) : isFetching ? (
            <div className="px-4 py-8 text-center" style={{ color: "var(--color-text-3)" }}>
              Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center" style={{ color: "var(--color-text-3)" }}>
              No results found for “{query}”
            </div>
          ) : (
            results.map((item: any, i: number) => {
              const s = (TYPE_STYLES as Record<string, any>)[item.type] || { bg: "rgba(109,95,83,0.08)", color: "#6D5F53", border: "rgba(109,95,83,0.18)" };
              const active = i === selected;
              return (
                <button
                  key={item.type + item.id + i}
                  onClick={() => { router.push(item.url); onClose(); }}
                  onMouseEnter={() => setSelected(i)}
                  className="w-full text-left px-4 py-3 border-b transition-colors"
                  style={{
                    borderColor: "var(--color-divider)",
                    background: active ? "var(--color-bg-alt)" : "transparent",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        background: s.bg,
                        color: s.color,
                        border: `1px solid ${s.border}`,
                        borderRadius: 999,
                        padding: "2px 10px",
                        fontSize: "0.625rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        flexShrink: 0,
                      }}
                    >
                      {item.type.replace(/_/g, " ")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div style={{ color: "var(--color-text-1)", fontSize: "0.875rem", fontWeight: 600 }} className="truncate">
                        {item.label}
                      </div>
                      <div style={{ color: "var(--color-text-3)", fontSize: "0.75rem" }} className="truncate">
                        {item.meta}
                      </div>
                    </div>
                    <span style={{ color: "var(--color-text-3)", fontSize: "0.75rem" }}>↵</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
