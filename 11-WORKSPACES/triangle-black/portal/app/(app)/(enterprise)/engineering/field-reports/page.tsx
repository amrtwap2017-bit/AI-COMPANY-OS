"use client";
// @ts-nocheck
// Triangle Black — Engineering Field Reports
// Sprint-046: Engineering Data Portal
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

const fmtDate = (d: any) => { try { return new Date(d).toLocaleDateString("en-GB"); } catch { return "—"; } };

const SECTION_CONFIG = [
  { key:"site_visits",     label:"Site Visits",      icon:"🏗️",  color:"bg-blue-50 border-blue-200",   endpoint:"/api/v1/engineering/site-visits/" },
  { key:"quality_records", label:"Quality Records",  icon:"✅",  color:"bg-green-50 border-green-200",  endpoint:"/api/v1/engineering/quality-records/" },
  { key:"safety_records",  label:"Safety Records",   icon:"🦺",  color:"bg-orange-50 border-orange-200",endpoint:"/api/v1/engineering/safety-records/" },
  { key:"punch_list",      label:"Punch List Items", icon:"📋",  color:"bg-purple-50 border-purple-200",endpoint:"/api/v1/engineering/punch-list/" },
];

function RecordCard({ record, section }: { record: any; section: string }) {
  const title = record.title || record.visit_purpose || record.record_type || record.description || `Record`;
  const status = record.status || record.result || record.severity || "—";
  const date = record.visit_date || record.inspection_date || record.created_at;
  const person = record.visitor || record.inspector || record.reported_by || record.owner || "—";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--color-text-1)] truncate">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{person} · {fmtDate(date)}</p>
        </div>
        {status !== "—" && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize shrink-0">
            {status}
          </span>
        )}
      </div>
      {record.notes && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{record.notes}</p>
      )}
      {record.location && (
        <p className="text-xs text-gray-400 mt-1">📍 {record.location}</p>
      )}
    </div>
  );
}

export default function EngineeringFieldReportsPage() {
  const router = useRouter();
  const [mounted, setMounted]   = useState(false);
  const [data, setData]         = useState<Record<string,any[]>>({});
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("site_visits");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    Promise.all(
      SECTION_CONFIG.map(s =>
        tbFetch(`${s.endpoint}?limit=20`).then(r => r.data ?? r).catch(() => [])
      )
    ).then(results => {
      const d: Record<string,any[]> = {};
      SECTION_CONFIG.forEach((s, i) => {
        const items = Array.isArray(results[i]) ? results[i] : results[i]?.results || [];
        d[s.key] = items;
      });
      setData(d);
    }).finally(() => setLoading(false));
  }, [mounted]);

  const activeSection = SECTION_CONFIG.find(s => s.key === activeTab)!;
  const activeRecords = data[activeTab] || [];

  if (!mounted || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-1)]">Engineering Field Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Site visits, quality, safety and punch list data</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push("/engineering/inspections")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
            🔍 Inspections
          </button>
          <button onClick={() => router.push("/engineering")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
            ← Engineering
          </button>
        </div>
      </div>

      {/* Section KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {SECTION_CONFIG.map(s => (
          <button key={s.key}
            onClick={() => setActiveTab(s.key)}
            className={`${s.color} border rounded-xl p-4 text-left hover:opacity-80 transition-opacity ${activeTab===s.key ? "ring-2 ring-gray-900" : ""}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{s.icon}</span>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            </div>
            <p className="text-3xl font-bold text-[var(--color-text-1)]">{(data[s.key]||[]).length}</p>
          </button>
        ))}
      </div>

      {/* Active Section Records */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{activeSection.icon}</span>
          <h2 className="font-semibold text-[var(--color-text-1)]">{activeSection.label}</h2>
          <span className="text-sm text-gray-400">({activeRecords.length} records)</span>
        </div>

        {activeRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
            <p className="text-2xl mb-2">{activeSection.icon}</p>
            <p>No {activeSection.label.toLowerCase()} recorded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRecords.map((record: any, i: number) => (
              <RecordCard key={record.id || i} record={record} section={activeTab} />
            ))}
          </div>
        )}
      </div>

      {/* Maintenance APIs */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold text-gray-700 mb-3">Quick Access</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:"Downtime Records", path:"/maintenance/downtime/review", icon:"⏱️" },
            { label:"Cost Records",     path:"/maintenance/costs/review",    icon:"💰" },
            { label:"Work History",     path:"/maintenance/work-history",    icon:"📊" },
          ].map(item => (
            <button key={item.label} onClick={() => router.push(item.path)}
              className="bg-white border border-gray-200 rounded-xl p-3 text-left hover:bg-gray-50 flex items-center gap-2">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm text-gray-700 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
