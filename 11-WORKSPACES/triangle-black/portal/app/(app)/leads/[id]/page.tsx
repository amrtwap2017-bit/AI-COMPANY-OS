"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  status: string;
  priority: string;
  score: number;
  source: string;
  notes: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  qualified: "bg-green-100 text-green-800",
  assigned: "bg-yellow-100 text-yellow-800",
  converted: "bg-purple-100 text-purple-800",
  lost: "bg-red-100 text-red-800",
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qualifying, setQualifying] = useState(false);
  const [qualResult, setQualResult] = useState<{score: number; grade: string} | null>(null);

  useEffect(() => {
    async function fetchLead() {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch(`/api/v1/leads/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 404) {
          setError("Lead not found");
          return;
        }
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        setLead(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load lead");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchLead();
  }, [id]);

  async function qualifyLead() {
    try {
      setQualifying(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`/api/v1/actions/leads/${id}/qualify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.score !== undefined) {
        setQualResult({ score: data.score, grade: data.grade });
        if (lead) setLead({ ...lead, score: data.score });
      }
    } catch {
      alert("Failed to qualify lead");
    } finally {
      setQualifying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error || "Lead not found"}</p>
          <button onClick={() => router.back()} className="mt-2 text-sm text-blue-600 underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* Breadcrumb */}
      <button
        onClick={() => router.push("/leads")}
        className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1"
      >
        ← Back to Leads
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
          <p className="text-gray-500 mt-1">{lead.company}</p>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              STATUS_COLORS[lead.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {lead.status}
          </span>
          <button
            onClick={() => router.push(`/leads/${id}/edit`)}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Contact Info
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-gray-400 w-16">Email:</span>
              <span className="text-gray-900">{lead.email || "—"}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 w-16">Phone:</span>
              <span className="text-gray-900">{lead.phone || "—"}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 w-16">Company:</span>
              <span className="text-gray-900">{lead.company || "—"}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 w-16">Source:</span>
              <span className="text-gray-900 capitalize">{lead.source || "—"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Lead Score
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-blue-600">{lead.score || 0}</div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(lead.score || 0, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">out of 100</p>
            </div>
          </div>
          {qualResult && (
            <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-700">
              Qualified: score {qualResult.score} — grade: <strong>{qualResult.grade}</strong>
            </div>
          )}
          <button
            onClick={qualifyLead}
            disabled={qualifying}
            className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {qualifying ? "Qualifying..." : "Run AI Qualification"}
          </button>
        </div>
      </div>

      {/* Notes */}
      {lead.notes && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Notes
          </h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Timeline
        </h2>
        <div className="text-sm text-gray-500 space-y-1">
          <div>Created: {new Date(lead.created_at).toLocaleString()}</div>
          <div>Updated: {new Date(lead.updated_at).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
