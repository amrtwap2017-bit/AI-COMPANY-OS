"use client";
// @ts-nocheck
// Triangle Black — Knowledge Graph Search
// Sprint-051
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const TYPE_ICON: Record<string,string> = { asset:"🏭", supplier:"🏢", work_order:"🔧", contract:"📋", project:"🏗️" };
const TYPE_COLOR: Record<string,string> = {
  asset:"bg-blue-50 border-blue-200", supplier:"bg-purple-50 border-purple-200",
  work_order:"bg-orange-50 border-orange-200", contract:"bg-green-50 border-green-200",
};
const TYPE_PATH: Record<string,string> = {
  asset:"/maintenance/assets/", supplier:"/supply-chain/suppliers/",
  work_order:"/operations/work-orders/", contract:"/commercial/contracts/",
};

export default function KnowledgeGraphSearchPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!mounted) return;
    tbFetch("/api/v1/knowledge-graph/").then(r => r.data ?? r).then(setSummary).catch(()=>{});
  }, [mounted]);

  const search = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const d = await tbFetch(`/api/v1/knowledge-graph/search?q=${encodeURIComponent(q)}&limit=30`).then(r=>r.json());
      setResults(d.results || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Knowledge Graph</h1>
        <p className="text-gray-500 text-sm mt-1">Search assets, suppliers, contracts, work orders</p>
      </div>
      {summary && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[["Assets",summary.assets||0,"🏭"],["Work Orders",summary.work_orders||0,"🔧"],["Suppliers",summary.suppliers||0,"🏢"],["Contracts",summary.contracts||0,"📋"],["Projects",summary.projects||0,"🏗️"],["Total",summary.total_entities||0,"🔗"]].map(([l,v,i])=>(
            <div key={l} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-lg">{i}</p><p className="text-lg font-bold text-[var(--color-text-1)]">{v}</p>
              <p className="text-xs text-gray-400">{l}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-3">
        <input type="search" placeholder="Search all entities..." value={query}
          onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&search(query)}
          className="flex-1 border border-gray-300 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" autoFocus />
        <button onClick={()=>search(query)} disabled={loading||!query.trim()}
          className="px-6 py-3 bg-[var(--color-bg)] text-white rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
          {loading?"...":"Search"}
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-gray-400">Quick:</span>
        {["HVAC","Chiller","Electrical","ABB","Carrier","Fire","Test"].map(s=>(
          <button key={s} onClick={()=>{setQuery(s);search(s);}}
            className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full">{s}</button>
        ))}
      </div>
      {loading && <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"/></div>}
      {!loading && searched && results.length===0 && (
        <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
          <p className="text-2xl mb-2">🔍</p><p>No results for "{query}"</p>
        </div>
      )}
      {!loading && results.length>0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{results.length} results</p>
          {results.map((r:any,i:number)=>(
            <div key={r.id||i} onClick={()=>r.id&&TYPE_PATH[r.type]&&router.push(`${TYPE_PATH[r.type]}${r.id}`)}
              className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer hover:shadow-sm ${TYPE_COLOR[r.type]||"bg-gray-50 border-gray-200"}`}>
              <span className="text-2xl">{TYPE_ICON[r.type]||"📌"}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--color-text-1)] truncate">{r.label}</p>
                <p className="text-xs text-gray-500 capitalize">{r.type?.replace("_"," ")}{r.meta&&` · ${r.meta}`}</p>
              </div>
              <span className="text-gray-400">›</span>
            </div>
          ))}
        </div>
      )}
      {!searched && <div className="text-center py-12 text-gray-300"><p className="text-4xl mb-3">🔗</p><p className="text-gray-400 font-medium">Knowledge Graph Search</p></div>}
    </div>
  );
}
