"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { aiAssistantApi } from "@/lib/ai-assistant-api";
import { Send, Search, Lightbulb, Database, ChevronRight, Zap, MessageSquare, RefreshCw, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { PageHeader, SectionCard, Button, SearchInput, AlertBanner } from "@/components/ui";

const domainExamples = [
  { label:"Finance", examples:["What is our collection rate?","Show overdue invoices","How much have we invoiced?"] },
  { label:"Contracts", examples:["How many active contracts?","Which contracts are expiring?","Show win rate"] },
  { label:"Maintenance", examples:["Show maintenance status","How many work orders open?","Critical items?"] },
  { label:"Suppliers", examples:["How many suppliers?","What is our procurement spend?","Active RFQs?"] },
  { label:"Customers", examples:["What is customer health?","Clients at risk?","Satisfaction score?"] },
  { label:"Projects", examples:["Active projects status","Open project risks?","Phase progress?"] },
];

const priorityStyle: Record<string,string> = {
  critical:"bg-red-50 border-red-200 text-red-800",
  high:"bg-orange-50 border-orange-200 text-orange-800",
  medium:"bg-amber-50 border-amber-200 text-amber-800",
  low:"bg-slate-50 border-slate-200 text-slate-700",
};

interface Message { id:string; role:"user"|"assistant"; content:string; context?:string[]; timestamp:Date }

export default function AIAssistantPage() {
  const [messages,setMessages] = useState<Message[]>([{ id:"welcome", role:"assistant", content:"Hello! I'm the Triangle Black AI Assistant. I can answer questions about your finances, contracts, maintenance, suppliers, customers, and engineering — all grounded in your live data. What would you like to know?", timestamp:new Date() }]);
  const [input,setInput] = useState("");
  const [search,setSearch] = useState("");
  const [tab,setTab] = useState<"chat"|"search"|"recommendations">("chat");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const askMut = useMutation({
    mutationFn:(q:string)=>aiAssistantApi.ask(q),
    onSuccess:(data)=>setMessages(prev=>[...prev,{id:crypto.randomUUID(),role:"assistant",content:data.answer,context:data.context_used,timestamp:new Date()}]),
    onError:()=>setMessages(prev=>[...prev,{id:crypto.randomUUID(),role:"assistant",content:"I encountered an error. Please try again.",timestamp:new Date()}]),
  });
  const searchMut = useMutation({ mutationFn:(q:string)=>aiAssistantApi.search(q) });
  const recsQ = useQuery({ queryKey:["ai-recs"], queryFn:()=>aiAssistantApi.recommendations(), enabled:tab==="recommendations" });
  const knowledgeQ = useQuery({ queryKey:["ai-knowledge"], queryFn:()=>aiAssistantApi.companyKnowledge() });

  const sendMessage = (q:string) => {
    if(!q.trim()) return;
    setMessages(prev=>[...prev,{id:crypto.randomUUID(),role:"user",content:q,timestamp:new Date()}]);
    setInput("");
    askMut.mutate(q);
  };

  const summary = knowledgeQ.data?.data_summary||{};

  return (
    <div className="flex h-[calc(100vh-112px)] gap-0 -mx-6 -my-6">
      {/* sidebar */}
      <div className="w-64 border-r border-slate-200 bg-white flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-700 flex items-center justify-center shadow-sm">
              <Zap className="w-4.5 h-4.5 text-white w-5 h-5"/>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">AI Assistant</div>
              <div className="text-xs text-slate-400">Grounded · Live data</div>
            </div>
          </div>
          {Object.keys(summary).length>0&&(
            <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
              <div className="text-xs font-semibold text-slate-500 mb-1">Connected Data</div>
              {Object.entries(summary).slice(0,6).map(([k,v]:any)=>(
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-slate-500 capitalize">{k.replace(/_/g," ")}</span>
                  <span className="font-bold text-slate-900">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Suggested Questions</div>
          {domainExamples.map(domain=>(
            <div key={domain.label}>
              <div className="text-xs font-semibold text-slate-600 px-1 mb-1">{domain.label}</div>
              {domain.examples.map(ex=>(
                <button key={ex} onClick={()=>{setTab("chat");sendMessage(ex);}}
                  className="w-full text-left text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-50 px-2 py-2 rounded-lg transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-amber-500 flex-shrink-0"/>
                  {ex}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-200 px-4 flex items-center gap-0 flex-shrink-0">
          {[{key:"chat",label:"Chat",Icon:MessageSquare},{key:"search",label:"Search",Icon:Search},{key:"recommendations",label:"Recommendations",Icon:Lightbulb}].map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key as any)} className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${tab===t.key?"border-amber-600 text-amber-700":"border-transparent text-slate-500 hover:text-slate-700"}`}>
              <t.Icon className="w-4 h-4"/>{t.label}
            </button>
          ))}
        </div>

        {tab==="chat"&&(
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {messages.map(msg=>(
                <div key={msg.id} className={`flex ${msg.role==="user"?"justify-end":"justify-start"}`}>
                  <div className="max-w-2xl">
                    {msg.role==="assistant"&&<div className="flex items-center gap-2 mb-1.5"><div className="w-5 h-5 rounded-full bg-amber-700 flex items-center justify-center"><Zap className="w-3 h-3 text-white"/></div><span className="text-xs text-slate-400 font-medium">Triangle Black AI</span></div>}
                    <div className={`rounded-2xl px-4 py-3 ${msg.role==="user"?"bg-amber-700 text-white rounded-tr-sm shadow-sm":"bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"}`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      {msg.context&&msg.context.length>0&&(
                        <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-1.5">
                          <Database className="w-3 h-3 opacity-50"/>
                          <span className="text-xs opacity-60">Sources: {msg.context.join(", ")}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 mt-1 px-1">{msg.timestamp.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</div>
                  </div>
                </div>
              ))}
              {askMut.isPending&&(
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      {[0,100,200].map(d=><div key={d} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{animationDelay:`${d}ms`}}/>)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef}/>
            </div>
            <div className="bg-white border-t border-slate-200 p-4 flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-50 rounded-2xl border border-slate-200 px-4 py-2.5 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/10 focus-within:bg-white transition-all">
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage(input)}
                  placeholder="Ask anything about your business..." className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"/>
                <button onClick={()=>sendMessage(input)} disabled={!input.trim()||askMut.isPending}
                  className="w-8 h-8 rounded-xl bg-amber-700 text-white flex items-center justify-center hover:bg-amber-800 disabled:opacity-40 transition-all flex-shrink-0">
                  <Send className="w-3.5 h-3.5"/>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">Grounded in live platform data · Not a large language model hallucination</p>
            </div>
          </>
        )}

        {tab==="search"&&(
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            <div className="flex gap-3">
              <SearchInput value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchMut.mutate(search)} placeholder="Search across leads, contracts, suppliers, work orders, invoices..." className="flex-1"/>
              <Button variant="primary" size="md" onClick={()=>searchMut.mutate(search)} loading={searchMut.isPending}>Search</Button>
            </div>
            {searchMut.data&&(
              <div>
                <div className="text-sm text-slate-500 mb-3">{searchMut.data.count} result{searchMut.data.count!==1?"s":""} for "{searchMut.data.query}"</div>
                <div className="space-y-2">
                  {searchMut.data.results.map((r:any)=>(
                    <div key={r.id} className="bg-white rounded-2xl border border-slate-200 px-4 py-3.5 flex items-center justify-between hover:border-amber-300 transition-colors shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${r.type==="lead"?"bg-blue-100 text-blue-700":r.type==="contract"?"bg-emerald-100 text-emerald-700":r.type==="supplier"?"bg-amber-100 text-amber-700":r.type==="work_order"?"bg-orange-100 text-orange-700":r.type==="invoice"?"bg-purple-100 text-purple-700":"bg-slate-100 text-slate-700"}`}>
                          {r.type.replace("_"," ")}
                        </span>
                        <div><div className="text-sm font-semibold text-slate-900">{r.title}</div>{r.subtitle&&<div className="text-xs text-slate-400">{r.subtitle}</div>}</div>
                      </div>
                      <div className="flex items-center gap-2">{r.status&&<span className="text-xs text-slate-400">{r.status}</span>}<ChevronRight className="w-4 h-4 text-slate-300"/></div>
                    </div>
                  ))}
                  {searchMut.data.count===0&&<div className="text-center py-12 text-slate-400">No results for "{searchMut.data.query}"</div>}
                </div>
              </div>
            )}
            {!searchMut.data&&<div className="text-center py-16 text-slate-400"><Search className="w-10 h-10 mx-auto mb-3 text-slate-300"/><div className="text-sm font-medium">Search your entire platform</div><div className="text-xs mt-1">Leads · Contracts · Suppliers · Work Orders · Invoices · Documents</div></div>}
          </div>
        )}

        {tab==="recommendations"&&(
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            <div className="flex items-center justify-between">
              <div><h2 className="font-bold text-slate-900">AI Recommendations</h2><p className="text-sm text-slate-500">Priority actions based on live platform data</p></div>
              <Button variant="secondary" size="sm" icon={<RefreshCw className={`w-3.5 h-3.5 ${recsQ.isFetching?"animate-spin":""}`}/>} onClick={()=>recsQ.refetch()}>Refresh</Button>
            </div>
            {recsQ.isLoading&&<div className="text-center py-12 text-slate-400 text-sm">Analyzing platform data...</div>}
            {!recsQ.isLoading&&(recsQ.data?.recommendations||[]).length===0&&(
              <div className="text-center py-16"><CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3"/><div className="font-bold text-slate-900">All Clear</div><div className="text-sm text-slate-500 mt-1">No immediate actions required</div></div>
            )}
            {(recsQ.data?.recommendations||[]).map((rec:any)=>(
              <div key={rec.id} className={`rounded-2xl border p-5 ${priorityStyle[rec.priority]||"bg-slate-50 border-slate-200 text-slate-700"}`}>
                <div className="flex items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wide opacity-70">{rec.priority}</span>
                      <span className="opacity-30">·</span>
                      <span className="text-xs opacity-60 capitalize">{rec.domain}</span>
                    </div>
                    <div className="font-bold text-base">{rec.title}</div>
                    <div className="text-sm opacity-80 mt-1 leading-relaxed">{rec.description}</div>
                    <div className="flex items-center gap-1.5 mt-3">
                      <AlertTriangle className="w-3.5 h-3.5 opacity-60"/>
                      <span className="text-xs font-semibold opacity-80">{rec.action}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
