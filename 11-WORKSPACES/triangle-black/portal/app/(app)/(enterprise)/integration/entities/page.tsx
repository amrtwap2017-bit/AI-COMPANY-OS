"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function IntegrationEntities() {
  const queries = [
    { key: "ie-assets", api: "/api/v1/assets/", label: "Assets", domain: "Maintenance" },
    { key: "ie-wos", api: "/api/v1/work-orders/", label: "Work Orders", domain: "Operations" },
    { key: "ie-techs", api: "/api/v1/technicians/", label: "Technicians", domain: "Operations" },
    { key: "ie-srs", api: "/api/v1/service-requests/", label: "Service Requests", domain: "Operations" },
    { key: "ie-leads", api: "/api/v1/leads/", label: "Leads", domain: "Commercial" },
    { key: "ie-contracts", api: "/api/v1/contracts/", label: "Contracts", domain: "Commercial" },
    { key: "ie-invoices", api: "/api/v1/invoices/", label: "Invoices", domain: "Finance" },
    { key: "ie-prs", api: "/api/v1/purchase-requests/", label: "Purchase Requests", domain: "Procurement" },
    { key: "ie-pos", api: "/api/v1/purchase-orders/", label: "Purchase Orders", domain: "Procurement" },
    { key: "ie-inv", api: "/api/v1/inventory-items/", label: "Inventory Items", domain: "Inventory" },
    { key: "ie-pms", api: "/api/v1/maintenance/pm-plans/", label: "PM Plans", domain: "Maintenance" },
    { key: "ie-projects", api: "/api/v1/projects/", label: "Projects", domain: "Projects" },
    { key: "ie-suppliers", api: "/api/v1/suppliers/", label: "Suppliers", domain: "Procurement" },
    { key: "ie-notifs", api: "/api/v1/notifications/", label: "Notifications", domain: "Platform" },
  ];

  const results = queries.map(q => {
    const { data, isLoading } = useQuery([q.key], () => authFetch(q.api).then(r => r.json()));
    return { ...q, count: toArr(data).length, loading: isLoading };
  });

  const domains = [...new Set(results.map(r => r.domain))];

  return (
    <div className="tb-page">
      <h1 className="text-page-title text-primary">Platform Entities</h1>
      <p className="text-gray-500">All connected data entities across the platform</p>
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-gray-500">Entity Types</div>
          <div className="text-3xl font-bold">{results.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-gray-500">Total Records</div>
          <div className="text-3xl font-bold">{results.reduce((s, r) => s + r.count, 0).toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-gray-500">Domains</div>
          <div className="text-3xl font-bold">{domains.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <div className="text-sm text-gray-500">Connected APIs</div>
          <div className="text-3xl font-bold text-green-600">{results.filter(r => r.count > 0).length}</div>
        </div>
      </div>
      {domains.map(domain => (
        <div key={domain} className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-3">{domain}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {results.filter(r => r.domain === domain).map(r => (
              <div key={r.key} className="border rounded p-3">
                <div className="text-sm font-medium">{r.label}</div>
                <div className="text-2xl font-bold mt-1">{r.loading ? "..." : r.count}</div>
                <div className="text-xs text-gray-400 mt-1 font-mono truncate">{r.api}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
