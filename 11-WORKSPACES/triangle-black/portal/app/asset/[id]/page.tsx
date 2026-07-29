"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const fmtDate = (d) => {
  if (!d) return "—";
  try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); }
  catch { return "—"; }
};
const isOverdue = (d) => d && new Date(d) < new Date() && new Date(d).getFullYear() > 1990;
const PC = {critical:"#F87171",high:"#FB923C",medium:"#FBBF24",low:"#34D399"};
const SC = {open:"#2563EB",in_progress:"#D97706",completed:"#059669"};
const CRIT_BG = {critical:"#FEF2F2",high:"#FFF7ED",medium:"#FFFBEB",low:"#ECFDF5"};
const CRIT_TEXT = {critical:"#DC2626",high:"#EA580C",medium:"#D97706",low:"#059669"};

export default function AssetScanPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/qr/asset/${id}/data`)
      .then(r=>r.json())
      .then(d=>{ setData(d); setLoading(false); })
      .catch(()=>{ setError("Could not load asset data"); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#F8FAFC"}}>
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <div className="text-gray-600 text-lg font-medium animate-pulse">Loading asset…</div>
      </div>
    </div>
  );

  if (error || data?.error) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"#F8FAFC"}}>
      <div className="text-center p-8">
        <div className="text-5xl mb-4">❌</div>
        <div className="text-red-600 font-bold text-lg">Asset Not Found</div>
        <div className="text-gray-500 text-sm mt-2">QR code may be outdated or asset removed</div>
        <div className="text-xs text-gray-400 mt-4 font-mono">{id}</div>
      </div>
    </div>
  );

  const asset = data?.asset || {};
  const openWOs = data?.open_work_orders || [];
  const history = data?.maintenance_history || [];
  const stats = data?.stats || {};
  const overdue = stats.is_overdue;
  const cc = CRIT_TEXT[asset.criticality] || "#374151";
  const ccBg = CRIT_BG[asset.criticality] || "#F9FAFB";

  return (
    <div className="min-h-screen" style={{background:"#F8FAFC"}}>
      {/* HEADER */}
      <div style={{background:"#0F172A"}} className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:"#F59E0B"}}>
            <span className="text-white font-black text-sm">TB</span>
          </div>
          <div>
            <div className="text-white font-black text-sm">Triangle Black</div>
            <div className="text-slate-400 text-xs">Asset Scanner</div>
          </div>
        </div>
        <div className="text-xs text-slate-400">📱 Mobile View</div>
      </div>

      {/* ASSET HEADER */}
      <div className="px-4 py-5" style={{background:"white",borderBottom:"1px solid #E5E7EB"}}>
        {overdue && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
            <span>🚨</span>
            <span className="text-xs font-bold text-red-600">MAINTENANCE OVERDUE — Schedule immediately</span>
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-xl font-black text-gray-900 leading-tight">{asset.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{background:ccBg,color:cc}}>
                {(asset.criticality||"").toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">{asset.category}</span>
              <span className="text-xs text-gray-400">{asset.status}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{background:ccBg}}>
            <span className="text-2xl">{asset.category==="HVAC"?"❄️":asset.category==="Electrical"?"⚡":asset.category==="Fire"?"🔥":asset.category==="Mechanical"?"⚙️":"🏭"}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            {label:"Site",value:asset.site_name},
            {label:"Location",value:asset.location_description},
            {label:"Manufacturer",value:asset.manufacturer},
            {label:"Model",value:asset.model},
            {label:"Last Service",value:fmtDate(asset.last_maintenance_date)},
            {label:"Next Due",value:fmtDate(asset.next_maintenance_date)},
          ].map((row,i)=>(
            <div key={i} className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-400">{row.label}</div>
              <div className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{row.value||"—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="px-4 py-4" style={{background:"white",borderBottom:"1px solid #E5E7EB"}}>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</div>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={()=>router.push(`/operations/work-orders/new?asset=${id}`)}
            className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
            style={{background:"#059669"}}>
            ➕ Create Work Order
          </button>
          <div className="grid grid-cols-2 gap-3">
            <a href={`/api/v1/qr/asset/${id}/print-sheet`} target="_blank"
               className="py-3 rounded-2xl font-medium text-sm flex items-center justify-center gap-1 border border-gray-200 bg-white text-gray-700 active:bg-gray-50"
               style={{textDecoration:"none"}}>
              🖨️ Print QR Sheet
            </a>
            <a href={`/api/v1/qr/asset/${id}`} target="_blank"
               className="py-3 rounded-2xl font-medium text-sm flex items-center justify-center gap-1 border border-gray-200 bg-white text-gray-700 active:bg-gray-50"
               style={{textDecoration:"none"}}>
              📥 Download QR
            </a>
          </div>
        </div>
      </div>

      {/* OPEN WORK ORDERS */}
      <div className="px-4 py-4" style={{background:"white",borderBottom:"1px solid #E5E7EB",marginTop:"8px"}}>
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm font-bold text-gray-800">
            Open Work Orders {openWOs.length > 0 && <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-black" style={{background:"#DBEAFE",color:"#1D4ED8"}}>{openWOs.length}</span>}
          </div>
        </div>
        {openWOs.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-sm">No open work orders</div>
          </div>
        ) : (
          <div className="space-y-2">
            {openWOs.map((wo,i)=>{
              const pc=PC[wo.priority]||"#94A3B8";
              const sc=SC[wo.status]||"#94A3B8";
              return (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:pc}}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{wo.title}</div>
                    <div className="text-xs text-gray-400">{wo.technician_name||"Unassigned"} · Due: {fmtDate(wo.due_date)}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full flex-shrink-0" style={{background:sc+"20",color:sc}}>{(wo.status||"").replace(/_/g," ")}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MAINTENANCE HISTORY */}
      {history.length > 0 && (
        <div className="px-4 py-4" style={{background:"white",marginTop:"8px"}}>
          <div className="text-sm font-bold text-gray-800 mb-3">Maintenance History</div>
          <div className="space-y-2">
            {history.map((h,i)=>(
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <span className="text-lg flex-shrink-0">✅</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700 truncate">{h.title}</div>
                  <div className="text-xs text-gray-400">{h.type} · {h.technician_name||"—"} · {fmtDate(h.completed_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-6 text-center text-xs text-gray-400">
        Triangle Black Engineering Services<br/>
        Asset ID: {id?.slice(0,16)}
      </div>
    </div>
  );
}
