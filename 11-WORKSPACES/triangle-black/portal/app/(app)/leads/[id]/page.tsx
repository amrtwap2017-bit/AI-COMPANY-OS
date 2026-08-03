"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { leadsApi } from "@/lib/api/leads";
import { tbFetch } from "@/lib/api/tb-client";
import { tbFetch } from "@/lib/api/tb-client";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  qualified: "bg-green-100 text-green-800",
  negotiation: "bg-yellow-100 text-yellow-800",
  won: "bg-purple-100 text-purple-800",
  lost: "bg-red-100 text-red-800",
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qualifying, setQualifying] = useState(false);
  const [qualResult, setQualResult] = useState<{ score: number; grade: string } | null>(null);
  const [timeline, setTimeline] = useState<{type: string; description: string; created_at: string}[]>([]);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const r = await tbFetch(`/api/v1/leads/${id}`);
      if (r.error) {
        setError(r.error);
      } else {
        setLead(r.data);
        const tl = await leadsApi.timeline(id);
        if (tl.data) setTimeline(tl.data as any);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function qualify() {
    if (!id) return;
    setQualifying(true);
    const r = await leadsApi.qualify(id);
    if (r.data?.score !== undefined) {
      setQualResult({ score: r.data.score, grade: r.data.grade });
      if (lead) setLead({ ...lead });
    }
    setQualifying(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  if (error || !lead) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error || "Lead not found"}</p>
        <button onClick={() => router.push("/leads")} className="mt-2 text-sm text-blue-600 underline">
          Back to leads
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl">
      <button
        onClick={() => router.push("/leads")}
        className="text-sm text-blue-600 hover:underline mb-4 block"
      >
        ← Back to Leads
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
          <p className="text-gray-500 mt-1">{lead.company}</p>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[lead.status] || "bg-gray-100 text-gray-700"}`}>
            {lead.status}
          </span>
          <button
            onClick={() => router.push(`/leads/${id}/edit`)}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact</h2>
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-400">Email: </span><span className="text-gray-900">{lead.email || "—"}</span></div>
            <div><span className="text-gray-400">Phone: </span><span className="text-gray-900">{lead.phone || "—"}</span></div>
            <div><span className="text-gray-400">Source: </span><span className="text-gray-900 capitalize">{lead.source || "—"}</span></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">AI Qualification</h2>
          {qualResult && (
            <div className="mb-3 p-2 bg-green-50 rounded text-sm text-green-700">
              Score: <strong>{qualResult.score}</strong> — Grade: <strong>{qualResult.grade}</strong>
            </div>
          )}
          <button
            onClick={qualify}
            disabled={qualifying}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {qualifying ? "Running AI..." : "Run AI Qualification"}
          </button>
        </div>
      </div>

      {lead.notes && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Timeline</h2>
        {timeline.length === 0 ? (
          <p className="text-sm text-gray-400">No activity yet</p>
        ) : (
          <div className="space-y-2">
            {timeline.slice(0, 10).map((t, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="text-gray-400 text-xs w-32 shrink-0">
                  {new Date(t.created_at).toLocaleDateString()}
                </span>
                <span className="text-gray-600 capitalize font-medium w-24 shrink-0">{t.type}</span>
                <span className="text-gray-700">{t.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
