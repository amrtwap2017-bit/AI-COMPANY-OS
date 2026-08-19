"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];
const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };
const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
export default function GoodsReceiptsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: grRaw, isLoading } = useQuery(["gr-list"], () => authFetch("/api/v1/goods-receipts-portal").then(r => r.data ?? r));
  const grs = toArr(grRaw);
  const filtered = grs.filter((g: any) => !search || (g.receipt_number||g.id||"").toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero" >
        <div className="tb-hero-inner">
          <div className="text-label-upper text-emerald-400 mb-1.5">Supply Chain</div>
          <h1 className="tb-hero-title">Goods Receipts</h1>
          <p className="tb-hero-description">{grs.length} receipts recorded</p>
          <div className="tb-grid-4 mt-6">
            {[{label:"Total",value:grs.length,color:"#221D1A"},{label:"This Month",value:grs.filter((g: any) =>g.created_at&&new Date(g.created_at)>new Date(Date.now()-30*86400000)).length,color:"#547C4D"}].map((k: any, i: number) =>(
              <div key={i} className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:k.color}}>{k.value}</div><div className="tb-hero-kpi-label">{k.label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        <div className="tb-section">
          <div className="flex items-center gap-2 mb-4"><span className="text-secondary text-sm">🔍</span><input className="tb-search flex-1" placeholder="Search receipts..." value={search} onChange={(e: any) =>setSearch(e.target.value)}/></div>
          {isLoading ? <div className="space-y-3">{[1,2,3].map((i: any) =><div key={i} className="h-14 bg-base-alt rounded-xl animate-pulse"/>)}</div>
          : filtered.length===0 ? <div className="tb-empty"><div className="tb-empty-icon">✅</div><div className="tb-empty-title">No goods receipts</div></div>
          : <div className="tb-table" style={{borderRadius:12,overflow:"hidden"}}>
            <div className="tb-table-head" style={{gridTemplateColumns:"1fr 120px 120px 110px"}}>
              {["Receipt","PO Reference","Value","Date"].map((h: any, i: number) =><div key={i} className="tb-table-head-cell" style={{textAlign:i>0?"center":"left"}}>{h}</div>)}
            </div>
            {filtered.map((gr: any, i: any) =>(
              <button key={i} onClick={()=>router.push("/supply-chain/goods-receipts/"+gr.id)} className="tb-table-row" style={{gridTemplateColumns:"1fr 120px 120px 110px"}}>
                <div className="text-sm font-medium text-primary truncate pr-4">{gr.receipt_number||gr.id?.slice(0,16)}</div>
                <div className="text-center text-xs text-secondary">{gr.purchase_order_id?.slice(0,12)||"—"}</div>
                <div className="text-center text-sm font-bold text-emerald-400">{fmtEGP(gr.total_amount||0)}</div>
                <div className="text-center text-xs text-tertiary">{fmtDate(gr.created_at)}</div>
              </button>
            ))}
          </div>}
        </div>
      </div>
    </div>
  );
}
