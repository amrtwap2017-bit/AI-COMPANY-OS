"use client";
// @ts-nocheck
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const sectionMap: Record<string, string> = {
  "assets": "/maintenance/assets",
  "pm-plans": "/maintenance/pm-plans",
  "work-history": "/maintenance/work-history",
  "inspection": "/maintenance/inspection-dashboard",
  "intelligence": "/maintenance/intelligence",
  "costs": "/maintenance/costs/review",
  "downtime": "/maintenance/downtime/review",
  "qr-codes": "/maintenance/qr-codes",
  "asset-tree": "/maintenance/asset-tree",
};

export default function MaintenanceSection() {
  const params = useParams();
  const router = useRouter();
  const section = String(params?.section || "");

  useEffect(() => {
    const target = sectionMap[section];
    if (target) {
      router.replace(target);
    }
  }, [section, router]);

  if (sectionMap[section]) {
    return <div className="p-6 text-gray-400">Redirecting to {section}...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Maintenance — {section}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(sectionMap).map(([key, path]) => (
          <button key={key} onClick={() => router.push(path)} className="bg-white dark:bg-zinc-900 rounded-lg border p-4 text-left hover:border-blue-400 transition-colors">
            <div className="font-medium capitalize">{key.replace(/-/g, " ")}</div>
            <div className="text-xs text-gray-400 mt-1">{path}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
