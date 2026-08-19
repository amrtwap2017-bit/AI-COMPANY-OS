// @ts-nocheck
"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const TYPE_CONFIG: Record<string, {icon:string; color:string}> = {
  "Work Order": { icon:"🔧", color:"#60A5FA" },
  "Asset":      { icon:"🏗️", color:"#F87171" },
  "Lead":       { icon:"👤", color:"#A78BFA" },
  "Contract":   { icon:"📄", color:"#FCD34D" },
  "Technician": { icon:"👷", color:"#34D399" },
  "Invoice":    { icon:"💰", color:"#34D399" },
};

export function GlobalSearch() {
  const router = useRouter();
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const debounce  = useRef<any>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const r = await authFetch(`/api/v1/search?q=${encodeURIComponent(q)}&limit=8`);
      const d = await r.json();
      setResults(d.results || []);
    } catch { setResults([]); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => {
    clearTimeout(debounce.current);
    if (query.length < 2) { setResults([]); return; }
    setLoading(true);
    debounce.current = setTimeout(() => doSearch(query), 280);
    return () => clearTimeout(debounce.current);
  }, [query, doSearch]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-2 px-3 py-1.5 bg-base-alt hover:bg-surface border border-border rounded-xl text-sm text-secondary transition-all"
      style={{minWidth:200}}>
      <Search size={14}/>
      <span>Search...</span>
    </button>
  );

  return (
    <div style={{position:"relative"}}>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-brand rounded-xl" style={{minWidth:280}}>
        {loading ? <Loader2 size={14} className="text-brand animate-spin"/> : <Search size={14} className="text-brand"/>}
        <input ref={inputRef} value={query} onChange={(e: any) =>setQuery(e.target.value)}
          onKeyDown={(e: any) =>e.key==="Escape"&&(setOpen(false),setQuery(""))}
          placeholder="Search work orders, assets, leads..."
          className="flex-1 bg-transparent outline-none text-sm text-primary"
          style={{minWidth:0}}
        />
        <button onClick={()=>{setOpen(false);setQuery("");}} className="text-tertiary hover:text-primary"><X size={14}/></button>
      </div>
      {(results.length > 0 || (query.length >= 2 && !loading)) && (
        <div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,zIndex:50,background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:12,boxShadow:"var(--shadow-lg)",overflow:"hidden",minWidth:320}}>
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-secondary text-center">No results for "{query}"</div>
          ) : results.map((r: any, i: number) =>{
            const tc = (TYPE_CONFIG as Record<string, any>)[r.type]||{icon:"📋",color:"#94A3B8"};
            return (
              <button key={i} onClick={()=>{router.push(r.path);setOpen(false);setQuery("");}}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-base-alt transition-colors border-b border-divider last:border-0">
                <span style={{fontSize:"1.125rem"}}>{tc.icon}</span>
                <divclassName="flex-1 min-w-0">
                  <div className="text-sm font-medium text-primary truncate">{r.title}</div>
                  <div className="text-xs text-secondary">{r.type}{r.sub?` · ${r.sub}`:""}</div>
                </div>
                <span style={{fontSize:"0.625rem",fontWeight:700,color:tc.color}}>{r.type}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
