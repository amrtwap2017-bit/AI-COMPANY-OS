"use client";

import { useEffect, useState } from "react";
import { getModels, routeModel } from "@/lib/api";
import { Cpu, Search } from "lucide-react";

export default function ModelsPage() {
  const [installed, setInstalled] = useState<string[]>([]);
  const [registered, setRegistered] = useState<string[]>([]);
  const [task, setTask] = useState("");
  const [routeResult, setRouteResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModels()
      .then(r => {
        setInstalled(r.data.installed || []);
        setRegistered(r.data.registered || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const testRoute = async () => {
    if (!task) return;
    const r = await routeModel(task);
    setRouteResult(r.data);
  };

  if (loading) return <div className="text-gray-400 animate-pulse">Loading models...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Models</h1>
        <p className="text-gray-400 text-sm mt-1">
          {installed.length} installed · {registered.length} registered
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Installed */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-green-400" /> Installed (Ollama)
          </h2>
          <div className="space-y-2">
            {installed.map(m => (
              <div key={m} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-gray-200 font-mono">{m}</span>
              </div>
            ))}
            {installed.length === 0 && (
              <p className="text-gray-600 text-sm">No models found</p>
            )}
          </div>
        </div>

        {/* Model Router Test */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-400" /> Test Model Router
          </h2>
          <p className="text-xs text-gray-500">
            Enter a task description to see which model gets selected
          </p>
          <div className="flex gap-2">
            <input
              value={task}
              onChange={e => setTask(e.target.value)}
              onKeyDown={e => e.key === "Enter" && testRoute()}
              placeholder="e.g. write a Python function..."
              className="flex-1 bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={testRoute}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
            >
              Route
            </button>
          </div>
          {routeResult && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <p className="text-xs text-gray-500">Selected Model</p>
              <p className="text-white font-mono font-bold">{routeResult.selected_model}</p>
              {routeResult.capabilities?.strengths && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {routeResult.capabilities.strengths.map((s: string) => (
                    <span key={s} className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
