"use client";
// @ts-nocheck
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const sectionMap: Record<string, string> = {
  "pm-plans": "/engineering/pm-plans",
  "new-work-order": "/engineering/new-work-order",
  "maintenance-intelligence": "/engineering/maintenance-intelligence",
  "ai": "/engineering/ai",
  "actions": "/engineering/actions",
  "review": "/engineering/review",
  "intelligence": "/engineering/intelligence",
};

export default function EngineeringSection() {
  const params = useParams();
  const router = useRouter();
  const section = String(params?.section || "");

  useEffect(() => {
    const target = sectionMap[section];
    if (target) router.replace(target);
  }, [section, router]);

  if (sectionMap[section]) return <div className="p-6 text-gray-400">Redirecting...</div>;

  return (
    <div className="tb-page">
      <h1 className="text-page-title text-primary">Engineering — {section}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(sectionMap).map(([key, path]) => (
          <button key={key} onClick={() => router.push(path)} className="bg-white dark:bg-zinc-900 rounded-lg border p-4 text-left hover:border-blue-400 transition-colors">
            <div className="font-medium capitalize">{key.replace(/-/g, " ")}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
