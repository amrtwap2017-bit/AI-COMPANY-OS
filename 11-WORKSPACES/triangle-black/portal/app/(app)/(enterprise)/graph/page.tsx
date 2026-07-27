"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function PlatformGraph() {
  const router = useRouter();
  const { data: dash } = useQuery(["gr-dash"], () => authFetch("/api/v1/dashboard/summary").then(r => r.json()));
  const { data: twin } = useQuery(["gr-twin"], () => authFetch("/api/v1/twin/state").then(r => r.json()));

  const d = dash || {};

  const entities = [
    { name: "Leads", count: d.commercial?.total_leads ?? 0, domain: "Commercial", color: "blue", icon: "👤", connections: ["Contracts", "Invoices"], path: "/commercial/leads" },
    { name: "Contracts", count: 72, domain: "Commercial", color: "amber", icon: "📄", connections: ["Work Orders", "Invoices", "Projects"], path: "/commercial/contracts" },
    { name: "Work Orders", count: d.work_orders?.total ?? 0, domain: "Operations", color: "orange", icon: "🔧", connections: ["Assets", "Technicians", "Service Requests"], path: "/operations/work-orders" },
    { name: "Assets", count: d.assets?.total ?? 0, domain: "Maintenance", color: "purple", icon: "🏗️", connections: ["PM Plans", "Work Orders"], path: "/maintenance/assets" },
    { name: "PM Plans", count: d.maintenance?.pm_plans ?? 0, domain: "Maintenance", color: "red", icon: "📅", connections: ["Work Orders", "Assets"], path: "/maintenance/pm-plans" },
    { name: "Technicians", count: d.platform?.technicians ?? 0, domain: "Operations", color: "emerald", icon: "👷", connections: ["Work Orders"], path: "/operations/technicians" },
    { name: "Invoices", count: d.finance?.total_invoices ?? 0, domain: "Finance", color: "green", icon: "💰", connections: ["Contracts", "Leads"], path: "/invoices" },
    { name: "Purchase Requests", count: d.procurement?.purchase_requests ?? 0, domain: "Procurement", color: "yellow", icon: "🛒", connections: ["Purchase Orders", "Inventory"], path: "/supply-chain/purchase-requests" },
    { name: "Purchase Orders", count: d.procurement?.purchase_orders ?? 0, domain: "Procurement", color: "lime", icon: "📦", connections: ["Suppliers", "Warehouses"], path: "/supply-chain/purchase-orders" },
    { name: "Service Requests", count: d.service_requests?.total ?? 0, domain: "Operations", color: "cyan", icon: "📋", connections: ["Work Orders", "Contracts"], path: "/operations/service-requests" },
    { name: "Projects", count: d.platform?.projects ?? 0, domain: "Projects", color: "indigo", icon: "🏗️", connections: ["Contracts", "Work Orders"], path: "/projects-center" },
    { name: "Inventory", count: d.inventory?.total_items ?? 0, domain: "Supply Chain", color: "teal", icon: "📦", connections: ["Warehouses", "Purchase Requests"], path: "/supply-chain/inventory" },
    { name: "Suppliers", count: 15, domain: "Procurement", color: "slate", icon: "🏢", connections: ["Purchase Orders", "Inventory"], path: "/supply-chain/suppliers" },
    { name: "Notifications", count: d.platform?.notifications ?? 0, domain: "Platform", color: "pink", icon: "🔔", connections: ["All Domains"], path: "/inbox" },
  ];

  const domains = [...new Set(entities.map(e => e.domain))];
  const totalRecords = entities.reduce((s, e) => s + Number(e.count), 0);
  const totalConnections = entities.reduce((s, e) => s + e.connections.length, 0);

  return (
    <div className="tb-page">
      <div>
        <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Knowledge Graph</div>
        <h1 className="text-page-title text-primary">Platform Entity Map</h1>
        <p className="text-secondary mt-1">All connected entities across the Triangle Black ecosystem</p>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Entity Types", value: entities.length, color: "blue" },
          { label: "Total Records", value: totalRecords.toLocaleString(), color: "emerald" },
          { label: "Connections", value: totalConnections, color: "amber" },
          { label: "Domains", value: domains.length, color: "purple" },
        ].map((k, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-5 text-center">
            <div className={`text-3xl font-black text-${k.color}-500`}>{k.value}</div>
            <div className="text-xs text-secondary mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Entity grid by domain */}
      {domains.map(domain => (
        <div key={domain} className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-bold text-sm uppercase tracking-wider text-tertiary mb-4">{domain}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {entities.filter(e => e.domain === domain).map((entity, i) => (
              <button key={i} onClick={() => router.push(entity.path)}
                className="border border-border rounded-xl p-4 text-left hover:border-amber-400 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{entity.icon}</span>
                  <span className={`text-lg font-black text-${entity.color}-500`}>{entity.count}</span>
                </div>
                <div className="font-bold text-sm text-primary group-hover:text-amber-600 transition-colors">{entity.name}</div>
                <div className="text-xs text-tertiary mt-1">
                  Links to: {entity.connections.slice(0, 2).join(", ")}{entity.connections.length > 2 ? "..." : ""}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Workflow connections */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="font-bold text-primary mb-4">Core Workflow Chains</h2>
        <div className="space-y-3">
          {[
            { chain: ["Lead", "→", "Contract", "→", "Project", "→", "Work Order", "→", "Invoice"], color: "amber", label: "Revenue Lifecycle" },
            { chain: ["PM Plan", "→", "Work Order", "→", "Technician", "→", "Asset Update"], color: "blue", label: "Maintenance Lifecycle" },
            { chain: ["Service Request", "→", "Work Order", "→", "Dispatch", "→", "Completion"], color: "purple", label: "Service Lifecycle" },
            { chain: ["Stock Alert", "→", "Purchase Request", "→", "Purchase Order", "→", "Goods Receipt"], color: "emerald", label: "Procurement Lifecycle" },
          ].map((wf, i) => (
            <div key={i} className="flex items-center gap-2 p-3 bg-base-alt dark:bg-surface-alt rounded-xl">
              <span className={`text-xs font-bold text-${wf.color}-500 w-36 flex-shrink-0`}>{wf.label}</span>
              <div className="flex items-center gap-1 flex-wrap">
                {wf.chain.map((step, j) => (
                  <span key={j} className={step === "→" ? "text-tertiary" : `text-xs font-semibold px-2 py-0.5 rounded bg-${wf.color}-100 text-${wf.color}-700`}>
                    {step}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
