"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { apiFetch } from "@/lib/api";

interface Quote {
  id: string; lead_id: string; status: string;
  total_amount?: number; validity_date?: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#64748b", sent: "#2563eb",
  approved: "#059669", rejected: "#ef4444",
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Quote[]>("/quotes/?limit=100")
      .then(setQuotes).catch(() => setQuotes([]))
      .finally(() => setLoading(false));
  }, []);

  const total = quotes.reduce((s, q) => s + (q.total_amount || 0), 0);

  return (
    <AuthGuard>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Quotes</h1>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
              {quotes.length} quotes · Total:{" "}
              <strong>${total.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ color: "#94a3b8", padding: 32, textAlign: "center" }}>
            Loading quotes...
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 12,
            border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["ID", "Lead", "Amount", "Status", "Valid Until", "Created"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left",
                      fontSize: 12, fontWeight: 600, color: "#374151",
                      borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotes.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 32, textAlign: "center",
                    color: "#94a3b8" }}>No quotes yet</td></tr>
                ) : quotes.map(q => (
                  <tr key={q.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", fontSize: 12,
                      fontFamily: "monospace", color: "#64748b" }}>
                      {q.id.slice(0, 8)}...
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12,
                      color: "#64748b" }}>{q.lead_id?.slice(0, 8)}...</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 14 }}>
                      {q.total_amount ? `$${q.total_amount.toLocaleString()}` : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        background: STATUS_COLORS[q.status] || "#f1f5f9",
                        color: STATUS_COLORS[q.status] ? "#fff" : "#374151",
                        padding: "3px 10px", borderRadius: 20, fontSize: 12,
                        fontWeight: 600, textTransform: "capitalize",
                      }}>{q.status}</span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13,
                      color: "#64748b" }}>
                      {q.validity_date ? new Date(q.validity_date).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12,
                      color: "#94a3b8" }}>
                      {new Date(q.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
