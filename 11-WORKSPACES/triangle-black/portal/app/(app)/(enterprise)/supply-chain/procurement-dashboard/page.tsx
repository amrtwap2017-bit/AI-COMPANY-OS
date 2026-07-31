"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
const fmtEGP = (n) => "EGP " + Number(n || 0).toLocaleString();
const fmtK = (n) => Number(n || 0) >= 1000 ? `${(Number(n)/1000).toFixed(0)}K` : String(Math.round(n||0));
const COLORS = ["#B9924C","#547C4D","#A84A3D","#B07A2A","#5B7C8C","#8D7443"];
const AXIS = { fontSize: 11, fill: "var(--color-text-3)" };
export default function ProcurementDashboardPage() {
  const router = useRouter();
  const { data: proc, isLoading } = useQuery({ queryKey: ["proc-dash"], queryFn: () => authFetch("/api/v1/procurement/dashboard").then(r => r.json()), staleTime: 60000 });
  const sow = proc?.sow || {}; const rfqs = proc?.rfqs || {}; const pos = proc?.pos || {}; const vendors = proc?.vendors || {}; const grns = proc?.grns || {}; const approvals = proc?.approvals || {};
  const pipeline = [{ name:"SOWs", value: sow.total||0, fill:"#B9924C" }, { name:"RFQs", value: rfqs.total||0, fill:"#5B7C8C" }, { name:"POs", value: pos.total||0, fill:"#547C4D" }, { name:"GRNs", value: grns.total||0, fill:"#8D7443" }];
  const MODULES = [
    { label:"Scope of Work", icon:"📄", path:"/supply-chain/scope-of-work", count: sow.total||0 },
    { label:"RFQ Management", icon:"📨", path:"/supply-chain/rfq-management", count: rfqs.total||0 },
    { label:"Purchase Orders", icon:"📋", path:"/supply-chain/purchase-orders-v2", count: pos.total||0 },
    { label:"Goods Receipts", icon:"✅", path:"/supply-chain/goods-receipts", count: grns.total||0 },
    { label:"Vendor Management", icon:"🏢", path:"/supply-chain/vendor-management", count: vendors.total||0 },
    { label:"Invoice Matching", icon:"🧾", path:"/supply-chain/invoice-matching", count: 0 },
    { label:"Stock Balances", icon:"📦", path:"/supply-chain/stock-balances", count: 0 },
    { label:"Spend Analytics", icon:"📊", path:"/supply-chain/spend", count: 0 },
    { label:"Quotations", icon:"💬", path:"/supply-chain/quotations", count: rfqs.total||0 },
  ];
  return (
    <div style={{ minHeight:"100vh", background:"var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div><h1 className="tb-hero-title">Procurement Dashboard</h1>
              <p style={{ color:"var(--color-text-2)", fontSize:14, marginTop:4 }}>P2P pipeline · Vendor spend · Approvals · GRN status</p>
            </div>
            <button onClick={() => router.push("/supply-chain")} style={{ background:"none", border:"1px solid var(--color-border)", color:"var(--color-text-2)", borderRadius:8, padding:"8px 14px", fontSize:13, cursor:"pointer", fontWeight:600 }}>← Supply Chain</button>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color:"#B9924C", fontSize:15 }}>{fmtEGP(pos.total_value||0)}</div><div className="tb-hero-kpi-label">PO Spend</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value">{pos.total||0}</div><div className="tb-hero-kpi-label">Purchase Orders</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color: (approvals.pending||0) > 0 ? "#B07A2A" : "#547C4D" }}>{approvals.pending||0}</div><div className="tb-hero-kpi-label">Pending Approvals</div></div>
              <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{ color:"#547C4D" }}>{vendors.approved||0}</div><div className="tb-hero-kpi-label">Active Vendors</div></div>
            </>}
          </div>
        </div>
      </div>
      <div className="tb-canvas">
        {(approvals.pending||0) > 0 && (
          <div style={{ marginBottom:16, padding:"12px 16px", background:"rgba(176,122,42,0.08)", border:"1px solid rgba(176,122,42,0.25)", borderRadius:10, display:"flex", alignItems:"center", gap:10 }}>
            <span>⚠️</span>
            <span style={{ fontSize:13, fontWeight:700, color:"#B07A2A" }}>{approvals.pending} items pending approval</span>
            <button onClick={() => router.push("/approvals")} style={{ marginLeft:"auto", padding:"6px 12px", borderRadius:6, fontSize:12, fontWeight:700, cursor:"pointer", background:"rgba(176,122,42,0.12)", border:"1px solid rgba(176,122,42,0.3)", color:"#B07A2A" }}>Review →</button>
          </div>
        )}
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16 }}>
          <div className="tb-section">
            <h2 className="tb-section-title">P2P Pipeline</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pipeline} margin={{ top:10, right:10, left:10, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                <Tooltip contentStyle={{ background:"var(--color-surface)", border:"1px solid var(--color-border)", borderRadius:8, fontSize:12 }} />
                <Bar dataKey="value" radius={[6,6,0,0]}>{pipeline.map((e,i) => <Cell key={i} fill={e.fill} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="tb-section">
            <h2 className="tb-section-title">Pipeline Summary</h2>
            {[["SOW Total", sow.total||0],["SOW Approved", sow.approved||0],["RFQs Active", rfqs.total||0],["POs Total", pos.total||0],["PO Value", fmtEGP(pos.total_value||0)],["GRNs", grns.total||0],["Vendors", vendors.total||0],["Approved Vendors", vendors.approved||0]].map(([label,value],i,arr)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom: i<arr.length-1 ? "1px solid var(--color-border)" : "none" }}>
                <span style={{ fontSize:12, color:"var(--color-text-3)" }}>{label}</span>
                <span style={{ fontSize:12, fontWeight:700, color:"var(--color-text-1)" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10 }}>
          {MODULES.map((m,i) => (
            <button key={i} onClick={() => router.push(m.path)} style={{ padding:"14px 16px", borderRadius:10, cursor:"pointer", textAlign:"left", background:"var(--color-surface)", border:"1px solid var(--color-border)", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:20 }}>{m.icon}</span>
              <div><div style={{ fontWeight:700, fontSize:13, color:"var(--color-text-1)" }}>{m.label}</div>
              {m.count > 0 && <div style={{ fontSize:11, color:"#B9924C", fontWeight:600, marginTop:2 }}>{m.count} items</div>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
