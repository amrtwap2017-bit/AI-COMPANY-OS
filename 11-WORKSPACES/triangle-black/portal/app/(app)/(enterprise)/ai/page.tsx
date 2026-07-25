// @ts-nocheck
"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard, AlertBanner } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { toast } from "@/lib/toast";
import { Zap, Send, CheckCircle2, Wrench, AlertTriangle } from "lucide-react";

const EXAMPLES = [
  "HVAC unit in room 412 not cooling - guests complaining",
  "مكيف غرفة 204 لا يبرد - مطلوب صيانة عاجلة",
  "Pool pump making loud noise, water not circulating",
  "Emergency - generator 2 alarm triggered floor B2",
  "Elevator Tower A door not closing properly - safety issue",
  "AC broken lobby - urgent fix needed",
];

export default function AIAssistantPage() {
  const qc = useQueryClient();
  const [text, setText]           = useState("");
  const [parsed, setParsed]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [creating, setCreating]   = useState(false);
  const [created, setCreated]     = useState(null);
  const [error, setError]         = useState("");

  async function handleParse() {
    if (!text.trim()) { toast.error("Enter a request first"); return; }
    setLoading(true); setError(""); setParsed(null); setCreated(null);
    try {
      const res = await authFetch("/api/v1/ai/intake/request", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return [];
      const d = await res.json();
      setParsed(d);
    } catch (e) {
      setError(e.message || "Failed to parse request");
      toast.error("Parse failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!parsed?.work_order_payload) return;
    setCreating(true);
    try {
      const res = await authFetch("/api/v1/ai/intake/create-wo", {
        method: "POST",
        body: JSON.stringify(parsed.work_order_payload),
      });
      if (!res.ok) return [];
      const d = await res.json();
      setCreated(d);
      qc.invalidateQueries({ queryKey: ["ops-work-orders"] });
      qc.invalidateQueries({ queryKey: ["ai-signals"] });
      toast.success("Work order created: " + d.title);
    } catch (e) {
      toast.error(e.message || "Create failed");
    } finally {
      setCreating(false);
    }
  }

  const PRIORITY_COLOR = {
    critical: "bg-red-100 text-red-700",
    high:     "bg-orange-100 text-orange-700",
    medium:   "bg-blue-100 text-blue-700",
    low:      "bg-slate-100 text-slate-600",
  };

  return (
    <PageWrapper>
      <PageHeader
        title="AI Request Intake"
        subtitle="Convert any maintenance request (Arabic/English) to a structured work order"
        badge="AI"
      />

      {error && <AlertBanner type="error" title={error} />}

      {created && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800">Work Order Created Successfully</p>
            <p className="text-sm text-emerald-600">{created.title} · ID: {created.work_order_id?.slice(0,8)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Request Input" subtitle="Paste or type the maintenance request">
          <div className="space-y-4">
            <Textarea
              label="Request Text (Arabic or English)"
              placeholder="e.g. HVAC unit room 412 not cooling - urgent"
              value={text}
              onChange={e => { setText(e.target.value); setParsed(null); setCreated(null); }}
              rows={4}
            />
            <Button variant="primary" onClick={handleParse} loading={loading}
              icon={<Zap className="w-4 h-4" />} className="w-full justify-center">
              Parse with AI
            </Button>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">QUICK EXAMPLES:</p>
              <div className="space-y-1">
                {EXAMPLES.map((ex, i) => (
                  <button key={i} onClick={() => { setText(ex); setParsed(null); }}
                    className="w-full text-left text-xs text-slate-500 hover:text-amber-700 px-2 py-1 rounded hover:bg-amber-50 transition-colors truncate">
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Parsed Result" subtitle="AI-extracted work order fields">
          {!parsed ? (
            <div className="text-center py-12 text-slate-400">
              <Wrench className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Paste a request and click Parse with AI</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Title",    value: parsed.parsed?.title },
                  { label: "Type",     value: parsed.parsed?.type },
                  { label: "Location", value: parsed.parsed?.location },
                  { label: "Priority", value: parsed.parsed?.priority },
                ].map(f => (
                  <div key={f.label} className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{f.label}</p>
                    <p className={"text-sm font-semibold mt-0.5 capitalize " + (f.label === "Priority" ? (PRIORITY_COLOR[f.value] || "") + " px-2 py-0.5 rounded-full inline-block" : "text-slate-900")}>
                      {f.value || "—"}
                    </p>
                  </div>
                ))}
              </div>
              {parsed.matched_asset && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-xs font-semibold text-emerald-700">MATCHED ASSET</p>
                  <p className="text-sm text-emerald-800 mt-0.5">{parsed.matched_asset.name}</p>
                </div>
              )}
              {!created && (
                <Button variant="primary" onClick={handleCreate} loading={creating}
                  icon={<Send className="w-4 h-4" />} className="w-full justify-center">
                  Create Work Order
                </Button>
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </PageWrapper>
  );
}
