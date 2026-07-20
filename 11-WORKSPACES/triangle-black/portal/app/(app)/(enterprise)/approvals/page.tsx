// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { PageHeader, LoadingState, EmptyState, AlertBanner } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { safeFetch, toList } from "@/lib/safe-api";
import { CheckCircle, XCircle, Clock, FileText, RefreshCw } from "lucide-react";

type Approval = { id:string; title:string; project:string; requested_by:string; date:string; type:string; };

const MOCK: Approval[] = [
  { id:"a1", title:"Variation Order #002: Additional Lighting Points",  project:"Grand Cairo Renovation", requested_by:"Mohamed (Site Eng)", date:"2026-07-12", type:"variation" },
  { id:"a2", title:"Material Approval: Italian Marble Sample",          project:"Grand Cairo Renovation", requested_by:"Amr (PM)",           date:"2026-07-14", type:"material"  },
  { id:"a3", title:"Budget Increase: HVAC System Upgrade",             project:"Sharm Resort Phase 2",   requested_by:"Sara (Finance)",      date:"2026-07-15", type:"budget"    },
  { id:"a4", title:"Contractor Extension: Phase 3 Delay",              project:"Hilton Alexandria",      requested_by:"Khaled (Site)",       date:"2026-07-16", type:"extension" },
  { id:"a5", title:"Purchase Order: Elevator Parts",                   project:"Kempinski Soma Bay",     requested_by:"Omar (Procurement)",  date:"2026-07-17", type:"purchase"  },
];

export default function ApprovalsPage() {
  const [items, setItems]   = useState<Approval[]>(MOCK);
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState<Set<string>>(new Set());

  async function action(id:string, approve:boolean) {
    setDone(d => new Set([...d, id]));
  }

  const pending = items.filter(i => !done.has(i.id));
  const typeColors:any = {
    variation:"bg-purple-100 text-purple-700", material:"bg-blue-100 text-blue-700",
    budget:"bg-red-100 text-red-700", extension:"bg-amber-100 text-amber-700",
    purchase:"bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="space-y-5 pb-12">
      <Breadcrumb/>
      <PageHeader title="Approvals Center" subtitle={`${pending.length} pending approvals`} badge="APV"
        actions={<button onClick={()=>{}} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><RefreshCw className="h-4 w-4"/></button>}/>

      {loading && <LoadingState type="cards" rows={3} cols={1}/>}

      {pending.length===0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4"/>
          <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
          <p className="text-slate-500 mt-2">No pending approvals at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map(item=>(
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-amber-600"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${typeColors[item.type]||"bg-slate-100 text-slate-600"}`}>{item.type}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/>{item.date}</span>
                </div>
                <h4 className="font-semibold text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{item.project} · Requested by {item.requested_by}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={()=>action(item.id,false)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors">
                  <XCircle className="w-4 h-4"/> Reject
                </button>
                <button onClick={()=>action(item.id,true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                  <CheckCircle className="w-4 h-4"/> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {done.size>0 && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 text-sm text-emerald-700">
          ✅ {done.size} approval(s) processed this session
        </div>
      )}
    </div>
  );
}
