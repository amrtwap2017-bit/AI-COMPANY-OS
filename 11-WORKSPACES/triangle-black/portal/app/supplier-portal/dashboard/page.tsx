"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtDate = (d: any) => { if(!d) return "—"; try { const dt=new Date(d); if(isNaN(dt.getTime())||dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB"); } catch { return "—"; } };
const SC = {draft:"#94A3B8",pending_approval:"#FBBF24",approved:"#60A5FA",sent:"#A78BFA",received:"#34D399",paid:"#10B981"};
const STARS = (r: any) => { const s=Math.round(r||0); return "★".repeat(s)+"☆".repeat(5-s); };

function SupplierNav({ supplier, active }: any) {
  const router = useRouter();
  const items = [
    {id:"dashboard",label:"🏠 Overview",path:"/supplier-portal/dashboard"},
    {id:"pos",label:"📦 Purchase Orders",path:"/supplier-portal/purchase-orders"},
    {id:"rfqs",label:"📝 RFQs & Bids",path:"/supplier-portal/rfqs"},
    {id:"invoices",label:"📄 My Invoices",path:"/supplier-portal/invoices"},
    {id:"profile",label:"🏢 My Profile",path:"/supplier-portal/profile"},
  ];
  return (
    <nav style={{background:"#0F172A",borderBottom:"1px solid rgba(255,255,255,0.08)"}} className="px-6 py-3 flex items-center gap-6">
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:"#F59E0B"}}>
          <span className="text-white font-black text-xs">TB</span>
        </div>
        <div>
          <div className="text-xs font-black text-white">{supplier?.company_name||"Supplier Portal"}</div>
          <div className="text-xs text-slate-400">{supplier?.category||""} · {supplier?.vendor_code||""}</div>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {items.map((item: any) =>(
          <button key={item.id} onClick={()=>router.push(item.path)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
            style={{background:active===item.id?"#D97706":"transparent",color:active===item.id?"white":"#94A3B8"}}>
            {item.label}
          </button>
        ))}
      </div>
      <button onClick={()=>{localStorage.removeItem("tb_supplier_token");localStorage.removeItem("tb_supplier");router.push("/supplier-portal");}}
        className="text-xs text-slate-500 hover:text-slate-300 flex-shrink-0">Sign Out</button>
    </nav>
  );
}

export default function SupplierDashboard() {
  const router = useRouter();
  const [supplier, setSupplier] = useState(null);
  const [token, setToken] = useState("");
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("tb_supplier_token");
    const s = localStorage.getItem("tb_supplier");
    if (!t) { router.push("/supplier-portal"); return; }
    setToken(t);
    const sup = s ? JSON.parse(s) : null;
    setSupplier(sup);
    if (sup?.vendor_id) {
      fetch(`/api/v1/supplier/dashboard?vendor_id=${sup.vendor_id}`, {headers:{Authorization:`Bearer ${t}`}})
        .then(r=>r.json()).then((d: any) => { setDash(d); setLoading(false); });
    }
  }, []);

  const po = dash?.purchase_orders || {};
  const inv = dash?.invoices || {};
  const rfq = dash?.rfqs || {};
  const vendor = dash?.vendor || {};
  const recent = dash?.recent_pos || [];

  return (
    <div className="min-h-screen" style={{background:"#0A0F1E"}}>
      <SupplierNav supplier={supplier} active="dashboard"/>
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Welcome, {supplier?.name?.split(" ")[0]||""}!</h1>
            <p className="text-slate-400 text-sm">{supplier?.company_name} · {supplier?.category}</p>
          </div>
          <div className="flex items-center gap-2">
            <span style={{color:"#FBBF24",fontSize:"1rem"}}>{STARS(vendor.rating||0)}</span>
            <span className="text-sm font-bold text-slate-300">{Number(vendor.rating||0).toFixed(1)}/5</span>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map((i: any) =><div key={i} className="h-24 rounded-2xl animate-pulse" style={{background:"#1E293B"}}/>)}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                {label:"Purchase Orders",value:po.total||0,sub:`${po.approved||0} approved`,color:"#60A5FA"},
                {label:"Total PO Value",value:fmtEGP(po.total_value||0),sub:"All time",color:"#34D399"},
                {label:"Outstanding",value:fmtEGP(inv.outstanding||0),sub:`${inv.total||0} invoices`,color:(inv.outstanding||0)>0?"#FBBF24":"#34D399"},
                {label:"Active RFQs",value:rfq.active||0,sub:`${rfq.total||0} total bids`,color:"#A78BFA"},
              ].map((k: any, i: number) =>(
                <div key={i} className="rounded-2xl p-5 border" style={{background:"#1E293B",borderColor:"rgba(255,255,255,0.08)"}}>
                  <div className="text-2xl font-black mb-1" style={{color:k.color}}>{k.value}</div>
                  <div className="text-sm font-bold text-white">{k.label}</div>
                  <div className="text-xs text-slate-400">{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Approval Status */}
            <div className="mb-4 p-4 rounded-2xl border" style={{background:vendor.is_approved?"#0D2A1E":"#2A1A0D",borderColor:vendor.is_approved?"#34D39940":"#FBBF2440"}}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{vendor.is_approved?"✅":"⚠️"}</span>
                <div>
                  <div className="font-bold" style={{color:vendor.is_approved?"#34D399":"#FBBF24"}}>
                    {vendor.is_approved ? "Approved Supplier" : "Pending Approval — Upload Required Documents"}
                  </div>
                  <div className="text-xs text-slate-400">{vendor.is_approved ? "You are approved to receive POs from Triangle Black" : "Upload Trade License and Tax Card to get approved"}</div>
                </div>
                {!vendor.is_approved && (
                  <button onClick={()=>router.push("/supplier-portal/profile")} className="ml-auto text-xs px-4 py-2 rounded-xl font-bold text-white" style={{background:"#D97706"}}>
                    Upload Docs →
                  </button>
                )}
              </div>
            </div>

            {/* Recent POs */}
            <div className="rounded-2xl border p-6" style={{background:"#1E293B",borderColor:"rgba(255,255,255,0.08)"}}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-white">Recent Purchase Orders</h2>
                <button onClick={()=>router.push("/supplier-portal/purchase-orders")} className="text-xs text-amber-400 hover:text-amber-300">View all →</button>
              </div>
              {recent.length === 0 ? (
                <div className="text-center py-8 text-slate-400"><div className="text-3xl mb-2">📦</div><div className="text-sm">No POs yet</div></div>
              ) : (
                <div className="space-y-2">
                  {recent.map((po_item,i)=>{
                    const sc=SC[po_item.status]||"#94A3B8";
                    return (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl" style={{background:"rgba(255,255,255,0.03)"}}>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{po_item.po_number}</div>
                          <div className="text-xs text-slate-400">{po_item.title?.slice(0,40)} · {fmtDate(po_item.created_at)}</div>
                        </div>
                        <div className="text-sm font-bold text-emerald-400">{fmtEGP(po_item.total_amount||0)}</div>
                        <span className="text-xs px-2 py-1 rounded-full" style={{background:sc+"20",color:sc}}>{po_item.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {[
                {icon:"📝",title:"Submit Quote",desc:"Respond to active RFQs",path:"/supplier-portal/rfqs",color:"#D97706"},
                {icon:"📄",title:"View POs",desc:"See your purchase orders",path:"/supplier-portal/purchase-orders",color:"#2563EB"},
                {icon:"🏢",title:"Update Profile",desc:"Upload documents, update info",path:"/supplier-portal/profile",color:"#7C3AED"},
              ].map((action,i)=>(
                <button key={i} onClick={()=>router.push(action.path)}
                  className="rounded-2xl p-5 border text-left hover:border-opacity-50 transition-all"
                  style={{background:"#1E293B",borderColor:"rgba(255,255,255,0.08)"}}>
                  <span className="text-3xl">{action.icon}</span>
                  <div className="font-bold text-white mt-2">{action.title}</div>
                  <div className="text-sm text-slate-400">{action.desc}</div>
                  <div className="mt-3 text-xs font-medium" style={{color:action.color}}>Open →</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
