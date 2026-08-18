"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

export default function NewQuotePage() {
  const router = useRouter();
  const params = useSearchParams();
  const leadId = params.get("lead_id") || "";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function generateFromLead() {
    if (!leadId) { setError("No lead ID provided"); return; }
    setSaving(true);
    setError(null);
    const r = await tbFetch(`/api/v1/actions/leads/${leadId}/quote`, { method: "POST" });
    if (r.error) { setError(r.error); setSaving(false); return; }
    const quoteId = (r.data as any)?.id || (r.data as any)?.quote_id;
    if (quoteId) router.push(`/quotes/${quoteId}`);
    else router.push("/quotes");
  }

  if (!mounted) return null;

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => router.push("/leads")} className="text-sm text-blue-600 hover:underline mb-4 block">
        ← Back to Leads
      </button>
      <h1 className="text-2xl font-bold text-[var(--color-text-1)] mb-2">Create Quotation</h1>
      <p className="text-gray-500 text-sm mb-6">
        Generate a quotation for this lead based on their requirements.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {leadId ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            Generating quote for lead: <span className="font-mono">{leadId.slice(0, 8)}...</span>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            This will use AI to generate a service quotation based on the lead details and hotel requirements.
          </p>
          <div className="flex gap-3">
            <button onClick={generateFromLead} disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Generating..." : "Generate Quote with AI"}
            </button>
            <button onClick={() => router.back()}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-4">
            To create a quotation, go to a lead and click the generate quote button.
          </p>
          <button onClick={() => router.push("/leads")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Go to Leads
          </button>
        </div>
      )}
    </div>
  );
}
