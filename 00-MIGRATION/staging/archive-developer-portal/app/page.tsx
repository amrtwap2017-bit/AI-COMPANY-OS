import Link from "next/link";
import { hubGet } from "@/lib/hub";

type BuilderRun = {
  id: number; ts: string; run_group: string; actor_id: string;
  ok: boolean; duration_ms: number; error: string; requirement: string;
};

export default async function Home() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const data = await hubGet<{ runs: BuilderRun[] }>(
    `/builder/runs?limit=50&since_ts=${encodeURIComponent(since)}`,
    { runs: [] }
  );

  if (!data || !data.runs) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>
        <h2>Hub is not reachable</h2>
        <p>Make sure Hub is running: <code>PYTHONPATH=hub/src python -m hub.main</code></p>
      </div>
    );
  }

  return (
    <main>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>AI Engineering Hub — Runs</h1>
      <p style={{ color: "#64748b", marginTop: 4 }}>Last 7 days · {data.runs.length} runs</p>

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {data.runs.map((r) => (
          <div key={r.id} style={{
            background: "#fff",
            border: `1px solid ${r.ok ? "#bbf7d0" : "#fecaca"}`,
            borderLeft: `4px solid ${r.ok ? "#16a34a" : "#dc2626"}`,
            borderRadius: 10, padding: 14,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>#{r.id} — {r.ok ? "✓ OK" : "✗ FAILED"}</div>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
                  {r.ts.slice(0,19)} · {r.duration_ms}ms · {r.actor_id}
                </div>
                {r.requirement && <div style={{ marginTop: 6 }}>{r.requirement}</div>}
                {!r.ok && r.error && (
                  <div style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>
                    {r.error.slice(0, 120)}
                  </div>
                )}
              </div>
              <Link href={`/runs/${r.run_group}`}
                style={{ fontSize: 13, color: "#3b82f6", textDecoration: "none" }}>
                Trace →
              </Link>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8" }}>
              run_group: <code>{r.run_group}</code>
            </div>
          </div>
        ))}
        {data.runs.length === 0 && (
          <div style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>
            No runs yet. Start by creating a task.
          </div>
        )}
      </div>
    </main>
  );
}
