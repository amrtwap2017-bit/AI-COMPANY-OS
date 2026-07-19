"use client";

import { useEffect, useState } from "react";
import { getTools, getAgentTools, executeTool } from "@/lib/api";
import { Wrench, Play } from "lucide-react";

const AGENTS = [
  "backend","devops","architect","researcher",
  "analyst","tester","reviewer","writer",
];

export default function ToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("backend");
  const [agentTools, setAgentTools] = useState<string[]>([]);
  const [action, setAction] = useState("");
  const [params, setParams] = useState("{}");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTools().then(r => setTools(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    getAgentTools(selectedAgent)
      .then(r => setAgentTools(r.data.tools || []))
      .catch(() => {});
  }, [selectedAgent]);

  const execute = async () => {
    setLoading(true);
    try {
      let parsedParams = {};
      try { parsedParams = JSON.parse(params); } catch {}
      const r = await executeTool({
        tool: selectedTool,
        agent: selectedAgent,
        action: action || undefined,
        params: parsedParams,
      });
      setResult(r.data);
    } catch (e: any) {
      setResult({ success: false, error: e.response?.data?.detail || e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tool Framework</h1>
        <p className="text-gray-400 text-sm mt-1">{tools.length} tools available</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tool list */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider px-1">Available Tools</p>
          {tools.map(t => (
            <button
              key={t.name}
              onClick={() => setSelectedTool(t.name)}
              className={`w-full text-left p-3 rounded-xl border transition-colors ${
                selectedTool === t.name
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span className="text-sm font-medium">{t.name}</span>
              </div>
              <p className="text-xs mt-1 opacity-70">{t.description}</p>
            </button>
          ))}
        </div>

        {/* Execute */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <Play className="w-4 h-4" /> Execute Tool
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tool</label>
              <select
                value={selectedTool}
                onChange={e => setSelectedTool(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2"
              >
                <option value="">Select tool</option>
                {tools.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Agent</label>
              <select
                value={selectedAgent}
                onChange={e => setSelectedAgent(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2"
              >
                {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {agentTools.length > 0 && (
            <p className="text-xs text-gray-500">
              {selectedAgent} can use: {agentTools.join(", ")}
            </p>
          )}

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Action (optional)</label>
            <input
              value={action}
              onChange={e => setAction(e.target.value)}
              placeholder="e.g. list, read, status"
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Params (JSON)</label>
            <textarea
              value={params}
              onChange={e => setParams(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 font-mono"
            />
          </div>

          <button
            onClick={execute}
            disabled={loading || !selectedTool}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm transition-colors"
          >
            {loading ? "Executing..." : "Execute"}
          </button>

          {result && (
            <div className={`rounded-lg p-4 ${result.success ? "bg-gray-800" : "bg-red-900/30 border border-red-800"}`}>
              <p className="text-xs text-gray-500 mb-2">
                {result.success ? "✅ Success" : "❌ Failed"}
              </p>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-auto max-h-48">
                {result.error || JSON.stringify(result.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
