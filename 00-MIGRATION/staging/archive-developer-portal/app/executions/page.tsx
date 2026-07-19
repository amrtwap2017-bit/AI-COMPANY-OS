import { hubGet } from "@/lib/hub";
import Link from "next/link";

type ExecRun = {
  id: number | string; ts: string; run_group: string; actor_id: string;
  ok: boolean; duration_ms: number; error: string; requirement: string;
};

export default async function ExecutionsPage() {
  const data = await hubGet<{ runs: ExecRun[] }>("/builder/runs?limit=50", { runs: [] });
  const runs = data?.runs || [];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Executions</h1>
      <p style={{ color: "#64748b", marginTop: 4 }}>All Builder execution runs</p>

      <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
        {runs.map((r) => {
          const rid = String(r.id);
          return (
            <div key={rid} style={{
              background: "#fff",
              border: `1px solid ${r.ok ? "#bbf7d0" : "#fecaca"}`,
              borderLeft: `4px solid ${r.ok ? "#16a34a" : "#dc2626"}`,
              borderRadius: 8, padding: 12,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>
                    #{rid.slice(0,8)} — {r.ok ? "✓ OK" : "✗ FAILED"}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
                    {String(r.ts).slice(0,19)} · {r.duration_ms}ms · {r.actor_id}
                  </div>
                  {r.requirement && <div style={{ marginTop: 6 }}>{r.requirement}</div>}
                  {!r.ok && r.error && (
                    <div style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>
                      {String(r.error).slice(0, 120)}
                    </div>
                  )}
                </div>
                <Link href={`/runs/${r.run_group}`}
                  style={{ fontSize: 12, color: "#3b82f6", textDecoration: "none", whiteSpace: "nowrap" }}>
                  Trace →
                </Link>
              </div>
            </div>
          );
        })}
        {runs.length === 0 && <div style={{ color: "#94a3b8" }}>No execution runs yet.</div>}
      </div>
    </div>
  );
}
