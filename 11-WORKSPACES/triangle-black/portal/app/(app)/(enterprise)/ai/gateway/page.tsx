"use client";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { 
  Bot, ShieldCheck, Sparkles, Send, Clock, DollarSign, 
  Cpu, CheckCircle, AlertCircle, FileText, Database 
} from "lucide-react";

export default function AIGatewayPortalPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("maintenance_recommendation");
  const [selectedModel, setSelectedModel] = useState("qwen2.5:7b");
  const [executing, setExecuting] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Fetch Model Registry & Purpose Governance
  const { data: registry, isLoading } = useQuery(
    ["ai-gateway-registry"],
    () => authFetch("/api/v1/ai-gateway/registry").then(r => r.json()),
    { staleTime: 60000 }
  );

  const models: string[] = registry?.models || ["qwen2.5:7b", "llama3.2:3b", "gpt-4o-mini"];
  const purposes: string[] = registry?.purposes || [
    "maintenance_recommendation", "work_order_summary", 
    "supplier_analysis", "procurement_suggestion",
    "cost_anomaly_detection", "service_request_triage"
  ];

  const handleExecuteAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setExecuting(true);
    setErrorMsg("");
    setAiResult(null);

    try {
      const res = await authFetch("/api/v1/ai-gateway/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: selectedPurpose,
          prompt: prompt.trim(),
          model: selectedModel,
          max_tokens: 400
        })
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setAiResult(data);
      } else {
        setErrorMsg(data.error || "AI Policy rejection or provider error");
        setAiResult(data);
      }
    } catch (err: any) {
      setErrorMsg("Failed to execute AI gateway request: " + (err.message || String(err)));
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <Bot className="w-7 h-7 text-brand" />
              Governed AI Gateway
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-bg text-success-text border border-success-border">
              Enterprise Policy Active
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Centrally governed model routing, tenant context isolation, cost accounting, and full audit trails.
          </p>
        </div>
      </div>

      {/* Registry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Registered AI Models"
          value={registry?.model_count ?? models.length}
          sub="Ollama Local & Cloud"
          color="brand"
        />
        <KpiCard
          label="Governed Action Types"
          value={registry?.purpose_count ?? purposes.length}
          sub="RBAC Policy Enforced"
          color="emerald"
          status="ok"
        />
        <KpiCard
          label="Active Governance Layer"
          value="100%"
          sub="Zero Direct Provider Calls"
          color="blue"
          status="ok"
        />
        <KpiCard
          label="Audit Trail Logging"
          value="Enabled"
          sub="platform_audit_log"
          color="purple"
        />
      </div>

      {/* Execution Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Panel */}
        <div className="lg:col-span-7 rounded-xl border border-border bg-surface p-6 space-y-5">
          <h2 className="text-base font-semibold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Sparkles className="w-4 h-4 text-brand" />
            Dispatch Governed Intelligence
          </h2>

          <form onSubmit={handleExecuteAI} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Action Purpose
                </label>
                <select
                  value={selectedPurpose}
                  onChange={(e) => setSelectedPurpose(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand/30"
                >
                  {purposes.map((p) => (
                    <option key={p} value={p}>
                      {p.replace(/_/g, " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Target Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand/30"
                >
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Operational Context & Prompt
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Analyze Chiller Unit A failure history and suggest quarterly PM plan adjustments..."
                className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-brand/30"
                required
              />
            </div>

            <button
              type="submit"
              disabled={executing || !prompt.trim()}
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-md text-sm font-semibold bg-brand text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {executing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Routing Through AI Gateway...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Execute Governed Request
                </>
              )}
            </button>
          </form>
        </div>

        {/* Telemetry & Result Panel */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-surface p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-primary flex items-center gap-2 border-b border-divider pb-3">
              <ShieldCheck className="w-4 h-4 text-brand" />
              Intelligence Telemetry & Output
            </h2>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-lg bg-danger-bg border border-danger-border text-danger-text text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {aiResult && (
              <div className="mt-4 space-y-4">
                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg border border-border bg-surface-alt">
                    <span className="text-secondary block">Latency</span>
                    <span className="font-bold text-primary flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-brand" />
                      {aiResult.latency_ms ?? 0} ms
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border bg-surface-alt">
                    <span className="text-secondary block">Estimated Cost</span>
                    <span className="font-bold text-primary flex items-center gap-1 mt-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-success" />
                      ${aiResult.cost_estimate_usd ?? 0}
                    </span>
                  </div>
                </div>

                {/* AI Content Response */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                    Generated Recommendation
                  </span>
                  <div className="p-3.5 rounded-lg border border-border bg-surface-alt text-sm text-primary whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {aiResult.content || "No text content generated."}
                  </div>
                </div>
              </div>
            )}

            {!aiResult && !errorMsg && (
              <div className="text-center py-12 text-secondary space-y-2">
                <Bot className="w-10 h-10 text-tertiary mx-auto opacity-50" />
                <p className="text-sm font-medium">No request dispatched yet.</p>
                <p className="text-xs text-tertiary">Select a purpose, enter your prompt, and run.</p>
              </div>
            )}
          </div>

          {aiResult?.audit_id && (
            <div className="pt-3 border-t border-divider text-xs text-tertiary flex items-center justify-between">
              <span>Audit Ref: {aiResult.audit_id.slice(0, 13)}...</span>
              <span className="text-success flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Logged
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
