// @ts-nocheck
"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PageWrapper, PageHeader, SectionCard } from "@/components/ui";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { Send, Loader2, CheckCircle, Package, Users, AlertTriangle, Lightbulb, ArrowRight } from "lucide-react";

// Safe array extractor — handles all backend response shapes
const toArr = (d: any): any[] => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.records)) return d.records;
  return [];
};


const CHANNELS = [
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email",    label: "Email" },
  { key: "form",     label: "Online Form" },
  { key: "scan",     label: "Paper Scan" },
  { key: "verbal",   label: "Verbal/Call" },
];

const URGENCY = [
  { key: "urgent",  label: "Urgent (< 3 days)",    color: "border-red-400 bg-red-50" },
  { key: "normal",  label: "Normal (< 7 days)",     color: "border-amber-400 bg-amber-50" },
  { key: "planned", label: "Planned (< 14 days)",   color: "border-blue-400 bg-blue-50" },
];

const STATUS_COLORS: Record<string, string> = {
  available:     "bg-emerald-100 text-emerald-700",
  partial:       "bg-amber-100 text-amber-700",
  not_available: "bg-red-100 text-red-700",
};

export default function ProcurementIntakePage() {
  const [rawText, setRawText]   = useState("");
  const [channel, setChannel]   = useState("form");
  const [urgency, setUrgency]   = useState("normal");
  const [requester, setRequester] = useState("");
  const [result, setResult]     = useState<any>(null);
  const [prCreated, setPrCreated] = useState<any>(null);

  const parse = useMutation({
    mutationFn: () => authFetch("/api/v1/procurement/intake/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        raw_text:     rawText,
        channel,
        urgency,
        requested_by: requester || "portal_user",
      }),
    }).then(r => r.json()),
    onSuccess: (data) => setResult(data),
  });

  const createPR = useMutation({
    mutationFn: () => authFetch("/api/v1/procurement/intake/create-pr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        intake_id:     result?.intake_id,
        urgency,
        requested_by:  requester || "portal_user",
        channel,
        items:         result?.inventory_results?.map((r: any) => r.item) ?? [],
        approved_vendors: result?.vendor_recommendations?.slice(0,3) ?? [],
      }),
    }).then(r => r.json()),
    onSuccess: (data) => setPrCreated(data),
  });

  return (
    <PageWrapper>
      <PageHeader
        title="Procurement Request Intake"
        subtitle="Submit requests from any channel - AI parses, checks inventory, recommends vendors"
        badge="Program K"
      />

      {/* Step 1: Input */}
      {!result && (
        <div className="space-y-6">
          <SectionCard title="Step 1 - Describe What You Need">
            <p className="text-sm text-slate-500 mb-4">
              Write naturally in Arabic or English. Examples: "Need 5 AC filters for room 204",
              "مكيف الغرفة 204 لا يبرد", "Electrical panel MCB tripped - need replacement"
            </p>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              rows={6}
              placeholder="Describe your request here in any language, any format..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </SectionCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard title="Step 2 - Channel & Details">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Request Channel</label>
                  <div className="flex flex-wrap gap-2">
                    {toArr(CHANNELS).map(c  => (
                      <button key={c.key}
                        onClick={() => setChannel(c.key)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-all
                          ${channel === c.key ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 hover:border-slate-300"}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Urgency</label>
                  <div className="space-y-2">
                    {toArr(URGENCY).map(u  => (
                      <label key={u.key}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                          ${urgency === u.key ? u.color + " border-2" : "border-slate-200 hover:bg-slate-50"}`}>
                        <input type="radio" value={u.key} checked={urgency === u.key}
                          onChange={() => setUrgency(u.key)} className="w-4 h-4" />
                        <span className="text-sm font-medium">{u.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Requested By</label>
                  <input value={requester} onChange={e => setRequester(e.target.value)}
                    placeholder="Your name or employee ID"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="How It Works">
              <div className="space-y-3">
                {[
                  { step: "1", label: "Parse",     desc: "AI reads your request in Arabic or English" },
                  { step: "2", label: "Check",     desc: "Inventory checked automatically" },
                  { step: "3", label: "Source",    desc: "Vendors recommended by category + rating" },
                  { step: "4", label: "PR",        desc: "Purchase Request created automatically" },
                  { step: "5", label: "Approve",   desc: "Purchasing → Finance → You approve" },
                  { step: "6", label: "PO Sent",   desc: "Auto-sent endor after all approvals" },
                  { step: "7", label: "Receive",   desc: "Warehouse confirms delivery, stock updated" },
                ].map(s => (
                  <div key={s.step} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold
                                    flex items-center justify-center flex-shrink-0">{s.step}</div>
                    <div>
                      <span className="text-sm font-semibold text-slate-800">{s.label}</span>
                      <span className="text-xs text-slate-500 ml-2">{s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <button
            onClick={() => parse.mutate()}
            disabled={!rawText.trim() || parse.isPending}
            className="w-full h-14 bg-blue-600 text-white text-base font-semibold rounded-xl
                       flex items-center justify-center gap-3 hover:bg-blue-700 disabled:opacity-50"
          >
            {parse.isPending
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing request...</>
              : <><Send className="w-5 h-5" /> Submit Request - AI Will Handle The Rest</>}
          </button>
        </div>
      )}

      {/* Step 2: Results */}
      {result && !prCreated && (
        <div className="space-y-6">
          {/* Mentor Guidance */}
          {result.mentor_guidance?.length > 0 &(
            <div className="space-y-3">
              {result.mentor_guidance.map((g: any, i: number) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border
                  ${g.type === "urgent_sourcing" ? "bg-red-50 border-red-200" :
                    g.type === "pr_required" ? "bg-amber-50 border-amber-200" :
                    "bg-emerald-50 border-emerald-200"}`}>
                  <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <div className="font-semibold text-sm text-slate-800">{g.message}</div>
                    <div className="text-xs text-slate-600 mt-1">{g.action}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Available in Stock",  value: result.summary?.available ?? 0,   color: "text-emerald-600", icon: CheckCircle },
              { label: "Need to Procure",     value: result.summary?.to_procure ?? 0,  color: "text-red-600",     icon: Package },
              { label: "Vendors Found",       value: result.vendor_recommendations?.length ?? 0, color: "text-blue-600", icon: Users },
            ].map(s => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Inventory Results */}
          <SectionCard title={`Inventory Check (${result.inventory_results?.length} items)`}>
            <div className="space-y-3">
              {result.inventory_results?.map((r: any, i: number) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {r.item?.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Qty needed: {r.needed} · Available: {r.available}
                      </div>
                    </div>
                    <span classNam={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0
                      ${STATUS_COLORS[r.stock_status] ?? "bg-slate-100 text-slate-600"}`}>
                      {r.stock_status?.replace(/_/g," ")}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-2">{r.stock_message}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Vendor Recommendations */}
          {result.vendor_recommendations?.length > 0 && (
            <SectionCard title="Vendor Recommendations (AI Ranked)">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {result.vendor_recommendations?.slice(0,3).map((v: any, i: number) => (
                  <div key={i} className={`p-4 rounded-xl border ${i === 0 ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"}`}>
                    {i === 0 && (
                      <div className="text-xs font-bold text-blue-600 mb-2">★ TOP RECOMMDATION</div>
                    )}
                    <div className="font-semibold text-sm text-slate-800">{v.vendor_name}</div>
                    <div className="text-xs text-slate-500 mt-1">{v.category}</div>
                    <div className="flex gap-3 mt-2 text-xs text-slate-600">
                      <span>⭐ {v.rating?.toFixed(1)}/5</span>
                      <span>🚚 {v.lead_time_days}d</span>
                    </div>
                    {v.email && <div className="text-xs text-blue-60t-1 truncate">📧 {v.email}</div>}
                    <div className="text-xs text-slate-400 mt-2 italic">{v.ai_note}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setResult(null)}
              className="px-6 py-3 border border-slate-300 rounded-xl text-sm hover:bg-slate-50"
            >
              Start Over
            </button>
            {result.summary?.needs_pr && (
              <button
                onClick={() => createPR.mutate()}
                disabled={createPR.isPending}
                className="flex-1 h-12 bg-emerald-600 text-white font-semibold rounded-xl
                           flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
              >
                {createPR.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating PR...</>
                  : <><ArrowRight className="w-4 h-4" /> Create Purchase Request & Start Approval</>}
              </button>
            )}
            {!result.summary?.needs_pr && (
              <div className="flex-1 flex items-center justify-center bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2" /> All items available - fulfill from stock
              </div>
            )}
          </div>
        </div>
     )}


      {/* Step 3: PR Created */}
      {prCreated && (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Purchase Request Created!</h2>
          <p className="text-slate-600 mb-6">{prCreated.message}</p>

          <div className="max-w-md mx-auto space-y-3 text-left">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="text-xs font-semibold text-blue-600 uppercase mb-2">Approval Chain Started</div>
              {prCreated.approval_chain?.map((step: any) => (
                <div key={step.step} className="flex items-center gap-3 py-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${step.status === "pending" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                    {step.step}
                  </div>
                  <span className="text-sm text-slate-700">{step.role}</span>
                  <span className={`text-xs ml-auto capitalize ${step.status === "pending" ? "text-blue-600 font-semibold" : "text-slate-400"}`}>
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-xs text-slate-500 text-center">
              PR ID: {prCreated.pr_id?.slice(0,8)} · Required by: {prCreated.required_date?.slice(0,10)}
           </div>
          </div>

          <button
            onClick={() => { setResult(null); setPrCreated(null); setRawText(""); }}
            className="mt-6 px-8 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 text-sm font-medium"
          >
            Submit Another Request
          </button>
        </div>
      )}
    </PageWrapper>
  );
}
