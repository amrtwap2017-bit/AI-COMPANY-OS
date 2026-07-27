// @ts-nocheck
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Zap, FileText, Users, Package, Wrench, BarChart3,
  Plus, TrendingUp, X, Settings, Loader2,
} from "lucide-react";
import { authFetch } from "@/lib/hooks/useAuthFetch";

// ── Types ─────────────────────────────────────────────────────
interface SearchResult {
  id:    string;
  type:  string;
  title: string;
  sub:   string;
  path:  string;
}

interface NavCommand {
  id:          string;
  label:       string;
  description: string;
  icon:        any;
  action:      string;
  type:        string;
  shortcut?:   string;
}

// ── Static nav commands (shown when no query) ─────────────────
const NAV_COMMANDS: NavCommand[] = [
  { id:"exec",    label:"Executive Dashboard",  description:"KPIs, risks, portfolio",      icon:TrendingUp, action:"/executive",                    type:"navigate" },
  { id:"ops",     label:"Operations Center",    description:"Work orders & dispatch",       icon:Wrench,     action:"/operations/work-orders",        type:"navigate" },
  { id:"maint",   label:"Maintenance Center",   description:"Assets & PM plans",            icon:Wrench,     action:"/maintenance",                   type:"navigate" },
  { id:"comm",    label:"Commercial Center",    description:"Leads, contracts, pipeline",   icon:FileText,   action:"/commercial",                    type:"navigate" },
  { id:"supply",  label:"Supply Chain",         description:"Procurement & inventory",      icon:Package,    action:"/supply-chain",                  type:"navigate" },
  { id:"analy",   label:"Analytics",            description:"Scorecards & trends",          icon:BarChart3,  action:"/analytics",                     type:"navigate" },
  { id:"ai",      label:"AI Assistant",         description:"Platform intelligence",        icon:Zap,        action:"/ai",                            type:"navigate" },
  { id:"new-wo",  label:"New Work Order",       description:"Create corrective/preventive WO", icon:Plus,   action:"/engineering/new-work-order",    type:"create"   },
  { id:"settings",label:"Settings",             description:"Account & platform settings",  icon:Settings,   action:"/settings",                      type:"navigate" },
];

// ── Type icon + color map ────────────────────────────────────
const TYPE_CONFIG: Record<string, {icon:string; color:string; bg:string}> = {
  "Work Order": { icon:"🔧", color:"#60A5FA", bg:"rgba(96,165,250,0.1)"  },
  "Asset":      { icon:"🏗️", color:"#F87171", bg:"rgba(239,68,68,0.1)"   },
  "Lead":       { icon:"👤", color:"#A78BFA", bg:"rgba(167,139,250,0.1)" },
  "Contract":   { icon:"📄", color:"#FCD34D", bg:"rgba(245,158,11,0.1)"  },
  "Technician": { icon:"👷", color:"#34D399", bg:"rgba(16,185,129,0.1)"  },
  "Invoice":    { icon:"💰", color:"#34D399", bg:"rgba(16,185,129,0.1)"  },
};

// ── CommandBar ────────────────────────────────────────────────
export function CommandBar() {
  const router = useRouter();
  const [open,       setOpen]       = useState(false);
  const [query,      setQuery]      = useState("");
  const [results,    setResults]    = useState<SearchResult[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [selected,   setSelected]   = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<any>(null);

  // Open on Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
        setQuery("");
        setResults([]);
        setSelected(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const r = await authFetch(`/api/v1/search?q=${encodeURIComponent(q)}&limit=8`);
      const data = await r.json();
      setResults(data.results || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => doSearch(query), 280);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  // Keyboard nav
  const totalItems = query.length >= 2 ? results.length : NAV_COMMANDS.length;
  useEffect(() => { setSelected(0); }, [query, results.length]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown")  { e.preventDefault(); setSelected(s => Math.min(s+1, totalItems-1)); }
    if (e.key === "ArrowUp")    { e.preventDefault(); setSelected(s => Math.max(s-1, 0)); }
    if (e.key === "Enter")      { e.preventDefault(); handleSelect(selected); }
  };

  const handleSelect = (idx: number) => {
    if (query.length >= 2) {
      const r = results[idx];
      if (r) { router.push(r.path); setOpen(false); setQuery(""); }
    } else {
      const cmd = NAV_COMMANDS[idx];
      if (cmd) { router.push(cmd.action); setOpen(false); setQuery(""); }
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:2000,
      display:"flex", alignItems:"flex-start", justifyContent:"center",
      paddingTop:"12vh", paddingLeft:16, paddingRight:16,
    }}>
      {/* Backdrop */}
      <div onClick={() => setOpen(false)} style={{
        position:"absolute", inset:0,
        background:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)",
      }}/>

      {/* Panel */}
      <div style={{
        position:"relative", width:"100%", maxWidth:600,
        background:"#111827", border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:20, overflow:"hidden",
        boxShadow:"0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
      }}>

        {/* Search input */}
        <div style={{
          display:"flex", alignItems:"center", gap:12,
          padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)",
        }}>
          {loading
            ? <Loader2 size={18} style={{color:"rgba(148,163,184,0.6)", flexShrink:0, animation:"spin 0.8s linear infinite"}}/>
            : <Search size={18} style={{color:"rgba(148,163,184,0.6)", flexShrink:0}}/>
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search work orders, assets, leads, contracts..."
            style={{
              flex:1, background:"transparent", border:"none", outline:"none",
              fontSize:"1rem", color:"#F1F5F9", caretColor:"#F59E0B",
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(148,163,184,0.5)",padding:2}}>
              <X size={14}/>
            </button>
          )}
          <kbd style={{
            fontSize:"0.625rem", padding:"2px 6px", borderRadius:5,
            background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
            color:"rgba(148,163,184,0.5)", flexShrink:0,
          }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{maxHeight:400, overflowY:"auto"}}>

          {/* Live search results */}
          {query.length >= 2 && (
            <>
              {results.length === 0 && !loading && (
                <div style={{padding:"24px 20px", textAlign:"center", color:"rgba(148,163,184,0.5)", fontSize:"0.875rem"}}>
                  No results for "{query}"
                </div>
              )}
              {results.map((r, i) => {
                const tc = TYPE_CONFIG[r.type] || {icon:"📋", color:"rgba(148,163,184,0.8)", bg:"rgba(148,163,184,0.1)"};
                const isSelected = i === selected;
                return (
                  <button key={r.id} onClick={() => { router.push(r.path); setOpen(false); setQuery(""); }}
                    style={{
                      width:"100%", display:"flex", alignItems:"center", gap:12,
                      padding:"11px 20px", background:isSelected?"rgba(245,158,11,0.08)":"transparent",
                      border:"none", cursor:"pointer", textAlign:"left",
                      borderLeft:isSelected?"3px solid #F59E0B":"3px solid transparent",
                      transition:"all 80ms ease",
                    }}
                    onMouseEnter={() => setSelected(i)}
                  >
                    <div style={{
                      width:32, height:32, borderRadius:8, flexShrink:0,
                      background:tc.bg, display:"flex", alignItems:"center",
                      justifyContent:"center", fontSize:"1rem",
                    }}>
                      {tc.icon}
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:"0.875rem", fontWeight:600, color:"#F1F5F9"}} className="truncate">{r.title}</div>
                      <div style={{fontSize:"0.6875rem", color:"rgba(148,163,184,0.6)", marginTop:2}}>{r.type}{r.sub ? ` · ${r.sub}` : ""}</div>
                    </div>
                    <div style={{fontSize:"0.625rem", color:tc.color, fontWeight:700, flexShrink:0}}>{r.type}</div>
                  </button>
                );
              })}
            </>
          )}

          {/* Nav commands (default state) */}
          {query.length < 2 && (
            <>
              <div style={{padding:"10px 20px 4px", fontSize:"0.625rem", fontWeight:700, color:"rgba(148,163,184,0.4)", textTransform:"uppercase", letterSpacing:"0.1em"}}>
                Navigation
              </div>
              {NAV_COMMANDS.map((cmd, i) => {
                const Icon      = cmd.icon;
                const isSelected = i === selected;
                const isCreate   = cmd.type === "create";
                return (
                  <button key={cmd.id} onClick={() => { router.push(cmd.action); setOpen(false); }}
                    style={{
                      width:"100%", display:"flex", alignItems:"center", gap:12,
                      padding:"10px 20px", background:isSelected?"rgba(245,158,11,0.08)":"transparent",
                      border:"none", cursor:"pointer", textAlign:"left",
                      borderLeft:isSelected?"3px solid #F59E0B":"3px solid transparent",
                      transition:"all 80ms ease",
                    }}
                    onMouseEnter={() => setSelected(i)}
                  >
                    <div style={{
                      width:30, height:30, borderRadius:8, flexShrink:0,
                      background:isCreate?"rgba(245,158,11,0.1)":"rgba(255,255,255,0.05)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      <Icon size={14} style={{color:isCreate?"#FCD34D":"rgba(148,163,184,0.7)"}}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"0.8125rem", fontWeight:600, color:"#F1F5F9"}}>{cmd.label}</div>
                      <div style={{fontSize:"0.6875rem", color:"rgba(148,163,184,0.5)", marginTop:1}}>{cmd.description}</div>
                    </div>
                    {cmd.shortcut && (
                      <kbd style={{fontSize:"0.5625rem", padding:"2px 6px", borderRadius:4, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(148,163,184,0.5)"}}>
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding:"10px 20px", borderTop:"1px solid rgba(255,255,255,0.06)",
          display:"flex", alignItems:"center", gap:16,
          fontSize:"0.5625rem", color:"rgba(148,163,184,0.35)",
        }}>
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
          <span style={{marginLeft:"auto"}}>Ctrl+K to toggle</span>
        </div>
      </div>
    </div>
  );
}

export default CommandBar;
