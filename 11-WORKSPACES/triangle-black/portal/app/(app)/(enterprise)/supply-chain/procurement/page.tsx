"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const fmtEGP = (n) => "EGP " + Number(n || 0).toLocaleString();

export default function ProcurementHub() {
  const router = useRouter();
  const { data: dash } = useQuery(
    ["proc-dash"],
    () => authFetch("/api/v1/actions/procurement/dashboard").then((r) => r.json()),
    { staleTime: 60000 }
  );
  const d = dash || {};
  const pr = d.purchase_requests || {};
  const po = d.purchase_orders || {};
  const rfq = d.rfqs || {};
  const gr = d.goods_receipts || {};

  const modules = [
    {
      label: "Scope of Work",
      icon: "📋",
      path: "/supply-chain/scope-of-work",
      desc: "BOQ and cost estimates",
      count: null,
      color: "#60A5FA",
    },
    {
      label: "Suppliers",
      icon: "🏭",
      path: "/supply-chain/suppliers",
      desc: "Approved supplier list",
      count: null,
      color: "#34D399",
    },
    {
      label: "Purchase Requests",
      icon: "📝",
      path: "/supply-chain/purchase-requests",
      desc: "Internal purchase requests",
      count: pr.total || 0,
      color: "#60A5FA",
    },
    {
      label: "RFQs",
      icon: "⚖️",
      path: "/supply-chain/rfqs",
      desc: "Request for quotations",
      count: rfq.open || 0,
      color: "#A78BFA",
    },
    {
      label: "Purchase Orders",
      icon: "📦",
      path: "/supply-chain/purchase-orders",
      desc: "Approved purchase orders",
      count: po.total || 0,
      color: "#F97316",
    },
    {
      label: "Goods Receipts",
      icon: "✅",
      path: "/supply-chain/goods-receipts",
      desc: "Receive and inspect deliveries",
      count: null,
      color: "#34D399",
    },
    {
      label: "Inventory",
      icon: "🗃️",
      path: "/supply-chain/inventory",
      desc: "Stock levels and items",
      count: null,
      color: "#FBBF24",
    },
    {
      label: "Analytics",
      icon: "📊",
      path: "/supply-chain/spend",
      desc: "Spend analytics and KPIs",
      count: null,
      color: "#94A3B8",
    },
  ];

  const kpis = [
    { label: "Open PRs", value: pr.pending_approval || 0, color: "#60A5FA" },
    { label: "Active POs", value: po.total || 0, color: "#F97316" },
    { label: "Total Spend", value: fmtEGP(po.total_spend || 0), color: "#34D399" },
    { label: "Open RFQs", value: rfq.open || 0, color: "#A78BFA" },
  ];

  return (
    <div className="min-h-screen bg-base">
      <div
        className="tb-hero"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #0D1A12 100%)" }}
      >
        <div className="tb-hero-inner">
          <div className="text-label-upper text-emerald-400 mb-1.5">Supply Chain</div>
          <h1 className="tb-hero-title">Procurement</h1>
          <p className="tb-hero-description">
            End-to-end procurement: SOW → Supplier → RFQ → PO → GRN
          </p>
          <div className="tb-grid-4 mt-6">
            {kpis.map((k, i) => (
              <div key={i} className="tb-hero-kpi">
                <div className="tb-hero-kpi-value" style={{ color: k.color }}>
                  {k.value}
                </div>
                <div className="tb-hero-kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-section">
          <div className="text-label-upper text-tertiary mb-4">Procurement Modules</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {modules.map((m, i) => (
              <button
                key={i}
                onClick={() => router.push(m.path)}
                className="tb-section text-left hover:border-brand transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontSize: "1.75rem" }}>{m.icon}</span>
                  {m.count !== null && (
                    <span className="text-2xl font-black" style={{ color: m.color }}>
                      {m.count}
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-primary mb-1">{m.label}</div>
                <div className="text-xs text-tertiary">{m.desc}</div>
                <div className="text-xs text-brand mt-3">Open →</div>
              </button>
            ))}
          </div>
        </div>

        {d.top_vendors && d.top_vendors.length > 0 && (
          <div className="tb-section">
            <div className="tb-section-title">Top Suppliers by Spend</div>
            <div className="space-y-2 mt-2">
              {d.top_vendors.slice(0, 5).map((v, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl bg-base-alt"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-xs font-black text-secondary">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-primary truncate">
                      {v.vendor_name || "Supplier"}
                    </div>
                    <div className="text-xs text-tertiary">{v.total_pos} purchase orders</div>
                  </div>
                  <div className="text-sm font-bold text-emerald-400">
                    {fmtEGP(v.total_spend)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="tb-section">
          <div className="tb-section-title">Workflow</div>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              "Service Request",
              "→",
              "Scope of Work",
              "→",
              "Cost Approval",
              "→",
              "RFQ",
              "→",
              "Bid Comparison",
              "→",
              "Purchase Order",
              "→",
              "Goods Receipt",
              "→",
              "Invoice",
            ].map((step, i) => (
              <span
                key={i}
                className={step === "→" ? "text-tertiary text-lg" : "tb-badge"}
                style={
                  step !== "→"
                    ? {
                        background: "rgba(255,255,255,0.05)",
                        color: "#94A3B8",
                        padding: "4px 8px",
                      }
                    : {}
                }
              >
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
