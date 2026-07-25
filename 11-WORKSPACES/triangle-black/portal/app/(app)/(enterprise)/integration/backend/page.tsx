// @ts-nocheck
"use client";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { PageWrapper, PageHeader, SectionCard, LoadingState } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { Search, ExternalLink, Code, Server, ChevronDown, ChevronRight } from "lucide-react";

const METHOD_COLORS: Record<string, string> = {
  get:    "bg-emerald-100 text-emerald-700",
  post:   "bg-blue-100 text-blue-700",
  put:    "bg-amber-100 text-amber-700",
  patch:  "bg-orange-100 text-orange-700",
  delete: "bg-red-100 text-red-700",
};

function EndpointRow({ path, method, summary, tag }: any) {
  const [expanded, setExpanded] = useState(false);
  const color = METHOD_COLORS[method] ?? "bg-slate-100 text-slate-600";

  return (
    <div className="border border-slate-200 rounded-lg mb-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-left"
      >
        <span className={`px-2 py-0.5 rounded text-xs font-bold w-16 text-center flex-shrink-0 ${color}`}>
          {method.toUpperCase()}
        </span>
        <span className="font-mono text-sm text-slate-700 flex-1 truncate">{path}</span>
        {summary && (
          <span className="text-xs text-slate-400 hidden sm:block truncate max-w-48">{summary}</span>
        )}
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {expanded && (
        <div className="px-4 pb-3 border-t border-slate-100">
          <div className="text-sm text-slate-600 mt-2">{summary || "No description"}</div>
          <div className="mt-2 flex gap-2">
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Tag: {tag}</span>
            <a
              href={`http://localhost:8030/docs#/${tag}/${method}_${path.replace(/\//g,"_").replace(/[{}]/g,"")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> Swagger UI
            </a>
          </div>
          <div className="mt-2 p-2 bg-slate-800 rounded font-mono text-xs text-green-400">
            curl -s http://localhost:8030{path}
          </div>
        </div>
      )}
    </div>
  );
}

export default function APIDocsPage() {
  const [search, setSearch]   = useState("");
  const [tagFilter, setTag]   = useState("all");
  const [methodFilter, setMethod] = useState("all");

  const { data: openapi, isLoading } = useQuery({
    queryKey: ["openapi-spec"],
    queryFn: () => fetch("http://localhost:8030/openapi.json").then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  const { data: health = {} } = useQuery({
    queryKey: ["api-health"],
    queryFn: () => authFetch("/api/v1/health/detailed").then(r => r.json()),
    refetchInterval: 30000,
  });

  const endpoints = useMemo(() => {
    if (!openapi?.paths) return [];
    const result: any[] = [];
    for (const [path, methods] of Object.entries(openapi.paths as any)) {
      for (const [method, spec] of Object.entries(methods as any)) {
        if (["get","post","put","patch","delete"].includes(method)) {
          result.push({
            path,
            method,
            summary: (spec as any).summary ?? "",
            tag: ((spec as any).tags ?? ["other"])[0],
          });
        }
      }
    }
    return result;
  }, [openapi]);

  const tags = useMemo(() => {
    const t = new Set((endpoints || []).map(e  => e.tag));
    return ["all", ...Array.from(t).sort()];
  }, [endpoints]);

  const filtered = useMemo(() => {
    return (endpoints || []).filter(e  => {
      const matchSearch = !search ||
        e.path.toLowerCase().includes(search.toLowerCase()) ||
        e.summary.toLowerCase().includes(search.toLowerCase());
      const matchTag    = tagFilter === "all" || e.tag === tagFilter;
      const matchMethod = methodFilter === "all" || e.method === methodFilter;
      return matchSearch && matchTag && matchMethod;
    });
  }, [endpoints, search, tagFilter, methodFilter]);

  const byTag = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const e of filtered) {
      if (!groups[e.tag]) groups[e.tag] = [];
      groups[e.tag].push(e);
    }
    return groups;
  }, [filtered]);

  if (isLoading) return <PageWrapper><LoadingState title="Loading API docs..." /></PageWrapper>;

  return (
    <PageWrapper>
      <PageHeader
        title="API Documentation"
        subtitle={`${endpoints.length} endpoints · Triangle Black Backend v${openapi?.info?.version ?? "2.0"}`}
        badge={health?.status === "ok" ? "Backend Live" : "Check Backend"}
      />

      {/* Backend status */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Endpoints", value: endpoints.length,                           color: "text-slate-700" },
          { label: "API Tags",        value: tags.length - 1,                            color: "text-blue-600" },
          { label: "Backend Status",  value: health?.status === "ok" ? "Live" : "Check", color: health?.status === "ok" ? "text-emerald-600" : "text-red-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Links */}
      <div className="flex gap-3 mb-6">
        <a
          href="http://localhost:8030/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700"
        >
          <ExternalLink className="w-4 h-4" /> Swagger UI
        </a>
        <a
          href="http://localhost:8030/redoc"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-sm rounded-lg hover:bg-slate-50"
        >
          <Code className="w-4 h-4" /> ReDoc
        </a>
        <a
          href="http://localhost:8030/openapi.json"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-sm rounded-lg hover:bg-slate-50"
        >
          <Server className="w-4 h-4" /> OpenAPI JSON
        </a>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-48 border border-slate-200 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search endpoints..."
            className="flex-1 text-sm outline-none"
          />
        </div>
        <select value={tagFilter} onChange={e => setTag(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2">
          {(tags || []).map(t  => (
            <option key={t} value={t}>{t === "all" ? "All tags" : t}</option>
          ))}
        </select>
        <select value={methodFilter} onChange={e => setMethod(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2">
          {["all","get","post","put","patch","delete"].map(m => (
            <option key={m} value={m}>{m === "all" ? "All methods" : m.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Endpoint groups */}
      <div className="space-y-6">
        {Object.entries(byTag).map(([tag, eps]) => (
          <SectionCard key={tag} title={`${tag} (${eps.length})`}>
            {(eps || []).map(ep  => (
              <EndpointRow
                key={`${ep.method}-${ep.path}`}
                path={ep.path}
                method={ep.method}
                summary={ep.summary}
                tag={ep.tag}
              />
            ))}
          </SectionCard>
        ))}
        {Object.keys(byTag).length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Code className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No endpoints match your filters</p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
