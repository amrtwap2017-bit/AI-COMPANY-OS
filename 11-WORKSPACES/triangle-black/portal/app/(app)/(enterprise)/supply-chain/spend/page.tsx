"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiSkeleton } from "@/components/ui/LoadingSkeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const fmtEGP = (n) => "EGP " + Number(n || 0).toLocaleString();
const fmtK = (n) => Number(n || 0) >= 1000 ? `${(Number(n) / 1000).toFixed(0)}K` : String(Math.round(n || 0));
const COLORS = ["#B9924C", "#547C4D", "#A84A3D", "#B07A2A", "#5B7C8C", "#8D7443"];

const WarmTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10, padding: "10px 14px" }}>
      {label && <div style={{ fontSize: 12, color: "var(--color-text-3)", marginBottom: 4 }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 700, color: p.color || "var(--color-text-1)" }}>
          {p.name}: {fmtEGP(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function SpendAnalyticsPage() {
  const router = useRouter();

  const { data: proc, isLoading } = useQuery({
    queryKey: ["spend-proc"],
    queryFn: () => authFetch("/api/v1/procurement/dashboard").then(r => r.json()),
    staleTime: 60000,
  });

  const { data: finDash } = useQuery({
    queryKey: ["spend-fin"],
    queryFn: () => authFetch("/api/v1/financial/dashboard").then(r => r.json()),
    staleTime: 60000,
  });

  const sow = proc?.sow || {};
  const vendors = proc?.vendors || {};
  const rfqs = proc?.rfqs || {};
  const pos = proc?.pos || {};
  const grns = proc?.grns || {};
  const costs = finDash?.costs || {};

  const spendBreakdown = [
    { name: "PO Spend", value: Number(pos.total_value || 0) },
    { name: "Labor", value: Number(costs.total_labor || 0) },
    { name: "Materials", value: Number(costs.total_materials || 0) },
    { name: "Overhead", value: Number(costs.total_overhead_profit || 0) },
  ].filter(d => d.value > 0);

  const procPipeline = [
    { name: "SOWs", value: sow.total || 0, fill: "#B9924C" },
    { name: "RFQs", value: rfqs.total || 0, fill: "#5B7C8C" },
    { name: "POs", value: pos.total || 0, fill: "#547C4D" },
    { name: "GRNs", value: grns.total || 0, fill: "#8D7443" },
  ];

  const AXIS = { fontSize: 11, fill: "var(--color-text-3)" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="tb-hero-content">
            <div>
              <h1 className="tb-hero-title">Spend Analytics</h1>
              <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 4 }}>
                Procurement spend · Vendor performance · Pipeline overview
              </p>
            </div>
            <button onClick={() => router.push("/supply-chain")}
              style={{ background: "none", border: "1px solid var(--color-border)", color: "var(--color-text-2)", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
              ← Supply Chain
            </button>
          </div>
          <div className="tb-hero-kpis">
            {isLoading ? <KpiSkeleton /> : <>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#B9924C", fontSize: 15 }}>{fmtEGP(pos.total_value || 0)}</div>
                <div className="tb-hero-kpi-label">PO Spend</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{pos.total || 0}</div>
                <div className="tb-hero-kpi-label">Purchase Orders</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value">{vendors.approved || 0}</div>
                <div className="tb-hero-kpi-label">Active Vendors</div>
              </div>
              <div className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: "#547C4D" }}>{rfqs.total || 0}</div>
                <div className="tb-hero-kpi-label">RFQs Issued</div>
              </div>
            </>}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        {/* Charts Row */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
          <div className="tb-section">
            <h2 className="tb-section-title">Procurement Pipeline</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={procPipeline} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                <Tooltip content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{ fontSize: 12, color: "var(--color-text-3)" }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-1)" }}>{payload[0].value} items</div>
                  </div>;
                }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {procPipeline.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="tb-section">
            <h2 className="tb-section-title">Spend Breakdown</h2>
            {spendBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={spendBreakdown} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {spendBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<WarmTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-3)", fontSize: 13 }}>
                No spend data available
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {spendBreakdown.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                    <span style={{ fontSize: 12, color: "var(--color-text-2)" }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: COLORS[i % COLORS.length] }}>{fmtEGP(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { title: "SOW Summary", data: [["Total SOWs", sow.total || 0], ["Approved", sow.approved || 0], ["Pending", sow.pending || 0], ["Total Value", fmtEGP(sow.total_value || 0)]] },
            { title: "Vendor Summary", data: [["Total Vendors", vendors.total || 0], ["Approved", vendors.approved || 0], ["Avg Rating", (vendors.avg_rating || 0).toFixed(1) + " ★"]] },
            { title: "GRN Summary", data: [["Total GRNs", grns.total || 0], ["Received", grns.received || 0], ["Pending", grns.pending || 0]] },
          ].map(({ title, data }, i) => (
            <div key={i} className="tb-section">
              <h2 className="tb-section-title">{title}</h2>
              {data.map(([label, value], j, arr) => (
                <div key={j} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: j < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <span style={{ fontSize: 13, color: "var(--color-text-3)" }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-1)" }}>{value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="tb-section" style={{ marginTop: 16 }}>
          <h2 className="tb-section-title">Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {[
              { label: "Purchase Orders", path: "/supply-chain/purchase-orders-v2", icon: "📋" },
              { label: "RFQ Management", path: "/supply-chain/rfq-management", icon: "📨" },
              { label: "Invoice Matching", path: "/supply-chain/invoice-matching", icon: "🧾" },
              { label: "Vendor Management", path: "/supply-chain/vendor-management", icon: "🏢" },
              { label: "Stock Balances", path: "/supply-chain/stock-balances", icon: "📦" },
              { label: "Goods Receipts", path: "/supply-chain/goods-receipts", icon: "✅" },
            ].map((a, i) => (
              <button key={i} onClick={() => router.push(a.path)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, cursor: "pointer", background: "var(--color-surface-alt)", border: "1px solid var(--color-border)", color: "var(--color-text-2)", fontSize: 13, fontWeight: 600, textAlign: "left" }}>
                <span>{a.icon}</span><span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
