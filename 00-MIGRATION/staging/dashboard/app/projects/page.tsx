"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Activity } from "lucide-react";

export default function Page() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const endpoints: Record<string, string> = {
      agents:      "/agents",
      projects:    "/projects",
      workflows:   "/workflows/runs",
      memory:      "/memory/researcher",
      reflections: "/reflections",
      knowledge:   "/knowledge/documents",
    };
    const page = "projects";
    const ep   = endpoints[page] || "/health";
    api.get(ep).then(r => setData(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white capitalize flex items-center gap-2">
        <Activity className="w-6 h-6 text-blue-400" /> projects
      </h1>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <pre className="text-xs text-gray-300 overflow-auto max-h-96 whitespace-pre-wrap">
          {data ? JSON.stringify(data, null, 2) : "Loading…"}
        </pre>
      </div>
    </div>
  );
}
