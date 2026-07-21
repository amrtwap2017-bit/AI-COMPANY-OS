// @ts-nocheck
"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { useSearch } from "@/lib/hooks/useSearch";

interface SearchResult {
  id:       string;
  type:     string;
  title:    string;
  subtitle: string;
  href:     string;
}

export function GlobalSearch() {
  const router = useRouter();
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const [leads, wos, assets] = await Promise.all([
        authFetchJSON("/api/v1/actions/leads/search?q=" + encodeURIComponent(q) + "&limit=5").catch(()=>[]),
        authFetchJSON("/api/v1/work-orders?search=" + encodeURIComponent(q) + "&limit=5").catch(()=>[]),
        authFetchJSON("/api/v1/assets?search=" + encodeURIComponent(q) + "&limit=5").catch(()=>[]),
      ]);

      const r: SearchResult[] = [];
      const toList = (d:any) => Array.isArray(d)?d:d?.results||d?.items||d?.leads||[];

      toList(leads).slice(0,3).forEach((l:any) => r.push({
        id:l.id, type:"Lead", title:l.company_name||l.name||"Lead",
        subtitle:l.contact_name||l.email||"", href:"/leads/"+l.id,
      }));
      toList(wos).slice(0,3).forEach((w:any) => r.push({
        id:w.id, type:"Work Order", title:w.title||"Work Order",
        subtitle:w.status||"", href:"/work-orders",
      }));
      toList(assets).slice(0,3).forEach((a:any) => r.push({
        id:a.id, type:"Asset", title:a.name||"Asset",
        subtitle:a.location||a.asset_type||"", href:"/assets",
      }));

      setResults(r);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  function go(href: string) { router.push(href); setOpen(false); setQuery(""); }

  const TYPE_ICONS: Record<string,string> = { Lead:"👤", "Work Order":"🔧", Asset:"📦" };

  if (!open) return (
    <button onClick={()=>setOpen(true)}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
      <Search className="w-4 h-4"/>
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden sm:inline text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">⌘K</kbd>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" onClick={()=>setOpen(false)}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e=>e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          {loading ? <Loader2 className="w-5 h-5 text-slate-400 animate-spin flex-shrink-0"/> : <Search className="w-5 h-5 text-slate-400 flex-shrink-0"/>}
          <input autoFocus value={query} onChange={e=>setQuery(e.target.value)}
            placeholder="Search leads, work orders, assets..."
            className="flex-1 text-sm outline-none text-slate-900 placeholder-slate-400"/>
          <button onClick={()=>setOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4"/>
          </button>
        </div>
        {results.length > 0 && (
          <div className="py-2 max-h-80 overflow-y-auto">
            {results.map(r => (
              <button key={r.id} onClick={()=>go(r.href)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group">
                <span className="text-lg">{TYPE_ICONS[r.type]||"📋"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{r.title}</p>
                  <p className="text-xs text-slate-500">{r.type} · {r.subtitle}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors"/>
              </button>
            ))}
          </div>
        )}
        {query.length >= 2 && results.length === 0 && !loading && (
          <div className="py-8 text-center text-sm text-slate-400">
            No results for "{query}"
          </div>
        )}
        {!query && (
          <div className="p-4 text-xs text-slate-400 text-center">
            Type to search leads, work orders, assets...
          </div>
        )}
      </div>
    </div>
  );
}
