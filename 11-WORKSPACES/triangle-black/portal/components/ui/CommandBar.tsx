// @ts-nocheck
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Zap, FileText, Users, Package, Wrench, BarChart3,
  Plus, TrendingUp, ChevronRight, X, Clock, Settings, Clipboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: any;
  action: string;
  type: "navigate" | "create" | "ai" | "result";
  shortcut?: string;
  badge?: string;
}

const NAV_COMMANDS: CommandItem[] = [
  { id:"exec",     label:"Executive Dashboard",     icon:TrendingUp, action:"/executive",          type:"navigate" },
  { id:"cust",     label:"Customer Success",         icon:Users,      action:"/customers",          type:"navigate" },
  { id:"comm",     label:"Commercial Center",        icon:FileText,   action:"/commercial",         type:"navigate" },
  { id:"proc",     label:"Procurement Center",       icon:Package,    action:"/supply-chain",       type:"navigate" },
  { id:"maint",    label:"Maintenance Center",       icon:Wrench,     action:"/maintenance",        type:"navigate" },
  { id:"analy",    label:"Analytics Platform",       icon:BarChart3,  action:"/analytics",          type:"navigate" },
  { id:"ai",       label:"AI Assistant",             icon:Zap,        action:"/ai",                 type:"navigate" },
  { id:"new-wo",   label:"New Work Order",           icon:Plus,       action:"/operations/work-orders/new", type:"create" },
  { id:"new-lead", label:"New Lead",                 icon:Plus,       action:"/commercial/leads/new",       type:"create" },
  { id:"new-pr",   label:"New Purchase Request",     icon:Plus,       action:"/supply-chain/purchase-requests/new", type:"create" },
  { id:"ai-ask",   label:"Ask AI anything...",       icon:Zap,        action:"/ai",                 type:"ai", shortcut:"then type" },
];

const TYPE_ICON: Record<string, any> = {
  "Work Order":      Wrench,
  "Contract":        FileText,
  "Asset":           Settings,
  "Service Request": Clipboard,
};

interface Props { open: boolean; onClose: () => void }

export function CommandBar({ open, onClose }: Props) {
  const [query, setQuery]           = useState("");
  const [selected, setSelected]     = useState(0);
  const [searchResults, setResults] = useState<CommandItem[]>([]);
  const [searching, setSearching]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounce = useRef<NodeJS.Timeout | null>(null);
  const router   = useRouter();

  // Real search via API
  async function runSearch(q: string) {
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const token = localStorage.getItem("tb_token") || "";
      const res = await fetch(
        (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8030/api/v1") +
        "/analytics/search/global?q=" + encodeURIComponent(q),
        { headers: { Authorization: "Bearer " + token } }
      );
      if (!res.ok) { setResults([]); return; }
      const data = await res.json();
      const Icon_map: Record<string,any> = { "wrench":Wrench, "file-text":FileText, "settings":Settings, "clipboard":Clipboard };
      const items: CommandItem[] = (data.results ?? []).map((r: any) => ({
        id:          "sr-" + r.id,
        label:       r.title,
        description: r.subtitle + " · " + r.type,
        icon:        Icon_map[r.icon] ?? FileText,
        action:      r.url,
        type:        "result" as const,
        badge:       r.type,
      }));
      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (query.trim().length >= 2) {
      debounce.current = setTimeout(() => runSearch(query), 280);
    } else {
      setResults([]);
    }
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [query]);

  // Merge: search results first, then filtered nav commands
  const navFiltered = query
    ? NAV_COMMANDS.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.description?.toLowerCase().includes(query.toLowerCase())
      )
    : NAV_COMMANDS;

  const all = query.trim().length >= 2
    ? [...searchResults, ...navFiltered]
    : NAV_COMMANDS;

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const execute = useCallback((cmd: CommandItem) => {
    router.push(cmd.action);
    onClose();
  }, [router, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s+1, all.length-1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(s => Math.max(s-1, 0)); }
      if (e.key === "Enter" && all[selected]) execute(all[selected]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, all, selected, execute, onClose]);

  const typeColor: Record<string,string> = {
    navigate: "text-slate-400",
    create:   "text-emerald-600",
    ai:       "text-amber-600",
    result:   "text-blue-600",
  };

  const badgeColor: Record<string,string> = {
    "Work Order":      "bg-blue-50 text-blue-700 border-blue-200",
    "Contract":        "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Asset":           "bg-amber-50 text-amber-700 border-amber-200",
    "Service Request": "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            transition={{duration:0.15}}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{opacity:0,scale:0.97,y:-8}}
            animate={{opacity:1,scale:1,y:0}}
            exit={{opacity:0,scale:0.97,y:-8}}
            transition={{duration:0.15,ease:[0.4,0,0.2,1]}}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <Search className={`w-4 h-4 flex-shrink-0 transition-colors ${searching ? "text-amber-500 animate-pulse" : "text-slate-400"}`} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setSelected(0); }}
                placeholder="Search work orders, contracts, assets... or run a command"
                className="flex-1 text-sm text-slate-900 placeholder-slate-400 bg-transparent outline-none"
              />
              {query && (
                <button onClick={() => { setQuery(""); setResults([]); }} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {/* Section label */}
              {query.trim().length >= 2 && searchResults.length > 0 && (
                <div className="px-4 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Search Results
                </div>
              )}
              {searching && query.trim().length >= 2 && searchResults.length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 animate-pulse" /> Searching...
                </div>
              )}
              {query.trim().length >= 2 && !searching && searchResults.length === 0 && (
                <div className="px-4 py-2 text-xs text-slate-400">No matching records found</div>
              )}

              {/* Search result items */}
              {searchResults.map((cmd, idx) => {
                const Icon = cmd.icon;
                const isSelected = idx === selected;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => execute(cmd)}
                    onMouseEnter={() => setSelected(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? "bg-amber-50" : "hover:bg-slate-50"}`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{cmd.label}</div>
                      {cmd.description && <div className="text-xs text-slate-400 truncate">{cmd.description}</div>}
                    </div>
                    {cmd.badge && (
                      <span className={"text-xs px-2 py-0.5 rounded border font-medium flex-shrink-0 " + (badgeColor[cmd.badge] ?? "bg-slate-100 text-slate-600")}>
                        {cmd.badge}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  </button>
                );
              })}

              {/* Nav commands section */}
              {(navFiltered.length > 0 || !query) && (
                <div className="px-4 pt-2 pb-1">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {query.trim().length >= 2 ? "Commands" : "Quick Navigation"}
                  </div>
                </div>
              )}

              {navFiltered.map((cmd, navIdx) => {
                const idx = searchResults.length + navIdx;
                const Icon = cmd.icon;
                const isSelected = idx === selected;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => execute(cmd)}
                    onMouseEnter={() => setSelected(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? "bg-amber-50" : "hover:bg-slate-50"}`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      cmd.type === "create" ? "bg-emerald-100" : cmd.type === "ai" ? "bg-amber-100" : "bg-slate-100"
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${typeColor[cmd.type]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{cmd.label}</div>
                      {cmd.description && <div className="text-xs text-slate-400 truncate">{cmd.description}</div>}
                    </div>
                    {cmd.shortcut && <span className="text-xs text-slate-400 flex-shrink-0">{cmd.shortcut}</span>}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  </button>
                );
              })}

              {all.length === 0 && !searching && query && (
                <div className="py-10 text-center">
                  <Search className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <div className="text-sm text-slate-400">No results for <strong>{query}</strong></div>
                </div>
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
              <span className="ml-auto">⌘K to toggle</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
