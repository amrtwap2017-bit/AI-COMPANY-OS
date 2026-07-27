"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { useState } from "react";
const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function BulkOperations() {
  const router = useRouter();
  const [selectedWOs, setSelectedWOs] = useState([]);
  const [selectedPRs, setSelectedPRs] = useState([]);

  const { data: woRaw } = useQuery(["bulk-wos"], () => authFetch("/api/v1/work-orders/").then(r=>r.json()));
  const { data: prRaw } = useQuery(["bulk-prs"], () => authFetch("/api/v1/purchase-requests/").then(r=>r.json()));
  const { data: techRaw } = useQuery(["bulk-techs"], () => authFetch("/api/v1/technicians/").then(r=>r.json()));

  const wos = toArr(woRaw);
  const prs = toArr(prRaw);
  const techs = toArr(techRaw);

  const openWOs = wos.filter(w => w.status === "open");
  const pendingPRs = prs.filter(p => p.status === "pending" || p.status === "submitted");
  const activeTechs = techs.filter(t => t.is_active);

  const toggleWO = (id) => setSelectedWOs(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const togglePR = (id) => setSelectedPRs(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const selectAllWOs = () => setSelectedWOs(openWOs.map(w=>w.id));
  const clearWOs = () => setSelectedWOs([]);

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div>
        <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Operations</div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Bulk Operations</h1>
        <p className="text-slate-500 mt-1">Mass assign, approve, and update multiple records at once</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Open Work Orders",value:openWOs.length,color:"blue"},
          {label:"Pending PRs",value:pendingPRs.length,color:"amber"},
          {label:"Active Technicians",value:activeTechs.length,color:"emerald"},
          {label:"Selected WOs",value:selectedWOs.length,color:"purple"},
        ].map((k,i)=>(
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-center">
            <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-slate-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bulk WO Assignment */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Bulk Assign Work Orders</h2>
            <div className="flex gap-2">
              <button onClick={selectAllWOs} className="text-xs text-amber-500 hover:underline">Select All</button>
              <span className="text-slate-300">|</span>
              <button onClick={clearWOs} className="text-xs text-slate-500 hover:underline">Clear</button>
            </div>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            {openWOs.slice(0,15).map((w,i)=>(
              <label key={i} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${selectedWOs.includes(w.id)?"bg-blue-50 border border-blue-200":"bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50/50"}`}>
                <input type="checkbox" checked={selectedWOs.includes(w.id)} onChange={()=>toggleWO(w.id)} className="rounded" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{w.title}</div>
                  <div className="text-xs text-slate-400">{w.priority} · {w.status}</div>
                </div>
              </label>
            ))}
          </div>
          {selectedWOs.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="text-xs text-slate-500 mb-2">{selectedWOs.length} selected — Assign to:</div>
              <select className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-800 mb-2 focus:outline-none focus:border-amber-400">
                <option value="">— Select Technician —</option>
                {activeTechs.map(t=><option key={t.id} value={t.id}>{t.name} ({t.current_work_orders||0}/{t.max_work_orders||5})</option>)}
              </select>
              <button className="w-full bg-blue-600 text-white rounded-xl py-2 text-sm font-bold hover:bg-blue-700 transition-colors">
                Assign {selectedWOs.length} Work Orders
              </button>
            </div>
          )}
        </div>

        {/* Bulk PR Approval */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Bulk Approve Purchase Requests</h2>
            <span className="text-xs text-slate-400">{selectedPRs.length} selected</span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            {pendingPRs.slice(0,15).map((pr,i)=>(
              <label key={i} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${selectedPRs.includes(pr.id)?"bg-amber-50 border border-amber-200":"bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-50/50"}`}>
                <input type="checkbox" checked={selectedPRs.includes(pr.id)} onChange={()=>togglePR(pr.id)} className="rounded" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{pr.title||pr.pr_number}</div>
                  <div className="text-xs text-slate-400">{pr.department} · {pr.urgency}</div>
                </div>
              </label>
            ))}
          </div>
          {selectedPRs.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
              <button className="w-full bg-emerald-600 text-white rounded-xl py-2 text-sm font-bold hover:bg-emerald-700 transition-colors">
                ✅ Approve {selectedPRs.length} Requests
              </button>
              <button className="w-full bg-red-100 text-red-700 rounded-xl py-2 text-sm font-bold hover:bg-red-200 transition-colors">
                ❌ Reject {selectedPRs.length} Requests
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick bulk actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="font-bold text-slate-900 dark:text-white mb-4">Quick Bulk Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {label:"View All Open WOs",icon:"🔧",count:openWOs.length,path:"/operations/work-orders"},
            {label:"Dispatch Center",icon:"👷",count:activeTechs.length,path:"/operations/dispatch"},
            {label:"Approve All PRs",icon:"✅",count:pendingPRs.length,path:"/supply-chain/purchase-requests"},
            {label:"SLA Review",icon:"⏱️",count:wos.filter(w=>w.due_date&&new Date(w.due_date)<new Date()&&w.status!=="completed").length,path:"/operations/sla-review"},
          ].map((a,i)=>(
            <button key={i} onClick={()=>router.push(a.path)}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
              <div className="text-2xl mb-1">{a.icon}</div>
              <div className="text-lg font-black text-amber-500">{a.count}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{a.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
