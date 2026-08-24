"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fmtEGP = (n: any) => "EGP " + Number(n||0).toLocaleString();
const fmtK   = (n) => Number(n||0)>=1000?`${(Number(n)/1000).toFixed(0)}K`:String(Math.round(n||0));
const COLORS  = ["#B9924C","#547C4D","#A84A3D","#B07A2A","#5B7C8C","#8D7443"];
const AXIS    = {fontSize:11,fill:"var(--color-text-3)"};

const WarmTooltip = ({active,payload,label}: any) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="tb-section shadow-lg" className="px-3 py-2">
      {label&&<div className="text-xs text-tertiary mb-1">{label}</div>}
      {payload.map((p: any, i: number) =><div key={i} className="text-sm font-bold text-primary">{p.name}: {p.value}</div>)}
    </div>
  );
};

export default function ProcurementDashboardPage() {
  const router = useRouter();
  const { data: proc, isLoading } = useQuery({
    queryKey:["proc-dash"],
    queryFn:()=>authFetch("/api/v1/procurement/dashboard").then(r => (r as any).data ?? r),
    staleTime:60000
  });

  const sow       = proc?.sow       || {};
  const rfqs      = proc?.rfqs      || {};
  const pos       = proc?.pos       || {};
  const vendors   = proc?.vendors   || {};
  const grns      = proc?.grns      || {};
  const approvals = proc?.approvals || {};

  const pipeline = [
    {name:"SOWs", value:sow.total||0,  fill:"#B9924C"},
    {name:"RFQs", value:rfqs.total||0, fill:"#5B7C8C"},
    {name:"POs",  value:pos.total||0,  fill:"#547C4D"},
    {name:"GRNs", value:grns.total||0, fill:"#8D7443"},
  ];

  const MODULES = [
    {label:"Scope of Work",    icon:"📄", path:"/supply-chain/scope-of-work",       count:sow.total||0},
    {label:"RFQ Management",   icon:"📨", path:"/supply-chain/rfq-management",      count:rfqs.total||0},
    {label:"Purchase Orders",  icon:"📋", path:"/supply-chain/purchase-orders-v2",  count:pos.total||0},
    {label:"Goods Receipts",   icon:"✅", path:"/supply-chain/goods-receipts",      count:grns.total||0},
    {label:"Vendor Management",icon:"🏢", path:"/supply-chain/vendor-management",   count:vendors.total||0},
    {label:"Invoice Matching", icon:"🧾", path:"/supply-chain/invoice-matching",    count:0},
    {label:"Stock Balances",   icon:"📦", path:"/supply-chain/stock-balances",      count:0},
    {label:"Spend Analytics",  icon:"📊", path:"/supply-chain/spend",               count:0},
    {label:"Quotations",       icon:"💬", path:"/supply-chain/quotations",          count:rfqs.total||0},
  ];

  const summaryRows = [
    ["SOW Total",        sow.total||0],
    ["SOW Approved",     sow.approved||0],
    ["RFQs Active",      rfqs.total||0],
    ["POs Total",        pos.total||0],
    ["PO Value",         fmtEGP(pos.total_value||0)],
    ["GRNs",             grns.total||0],
    ["Vendors",          vendors.total||0],
    ["Approved Vendors", vendors.approved||0],
  ];

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-label-upper text-brand mb-1.5">Supply Chain</div>
              <h1 className="tb-hero-title">Procurement Dashboard</h1>
              <p className="tb-hero-description">P2P pipeline · Vendor spend · Approvals · GRN status</p>
            </div>
            <button onClick={()=>router.push("/supply-chain")} className="tb-btn tb-btn-secondary">← Supply Chain</button>
          </div>
          <div className="tb-grid-4 mt-6">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value text-brand" style={{fontSize:"14px"}}>{fmtEGP(pos.total_value||0)}</div>
                <div className="tb-hero-kpi-label">PO Spend</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{pos.total||0}</div>
                <div className="tb-hero-kpi-label">Purchase Orders</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{color:(approvals.pending||0)>0?"var(--color-warning)":"var(--color-success)"}}>{approvals.pending||0}</div>
                <div className="tb-hero-kpi-label">Pending Approvals</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value text-success">{vendors.approved||0}</div>
                <div className="tb-hero-kpi-label">Active Vendors</div>
              </div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {(approvals.pending||0)>0 && (
          <div className="tb-alert tb-alert-warning mb-4">
            <span>⚠️</span>
            <span className="text-sm font-bold">{approvals.pending} items pending approval</span>
            <button onClick={()=>router.push("/approvals")} className="tb-btn tb-btn-secondary tb-btn-sm ml-auto">Review →</button>
          </div>
        )}

        <div className="tb-grid-2 mb-4">
          <div className="tb-section">
            <div className="tb-section-title">P2P Pipeline</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pipeline} margin={{top:10,right:10,left:10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false}/>
                <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false}/>
                <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={fmtK}/>
                <Tooltip content={<WarmTooltip/>}/>
                <Bar dataKey="value" radius={[6,6,0,0]}>{pipeline.map((e: any, i: number) =><Cell key={i} fill={e.fill}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="tb-section">
            <div className="tb-section-title">Pipeline Summary</div>
            {summaryRows.map(([label,value],i)=>(
              <div key={i} className="tb-detail-row">
                <span className="tb-detail-key">{label}</span>
                <span className="tb-detail-value font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="tb-grid-3">
          {MODULES.map((m: any, i: number) =>(
            <button key={i} onClick={()=>router.push(m.path)} className="tb-action-item gap-3">
              <span className="text-xl">{m.icon}</span>
              <div className="text-left">
                <div className="text-sm font-bold text-primary">{m.label}</div>
                {m.count>0&&<div className="text-xs text-brand font-semibold mt-0.5">{m.count} items</div>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
