import { hubPost } from "@/lib/hub";

const TASK_TYPES = [
  "architecture","coding","research","local_coding",
  "reasoning","fast_review","embedding","general",
];

type Route = { task_type: string; model_id: string; provider: string; context_window: number; };

export default async function ModelsPage() {
  const routes: Route[] = [];

  for (const t of TASK_TYPES) {
    try {
      const r = await hubPost<{ model_id?: string; provider?: string; context_window?: number }>(
        "/models/route",
        { task_type: t, workspace_id: "default", local_only: false }
      );
      if (r?.model_id) {
        routes.push({ task_type: t, model_id: r.model_id, provider: r.provider || "", context_window: r.context_window || 0 });
      }
    } catch {}
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Model Router</h1>
      <p style={{ color: "#64748b", marginTop: 4 }}>The OS chooses the model. You never pick manually.</p>

      <div style={{ marginTop: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden" }}>
          <thead>
            <tr style={{ background: "#1e293b", color: "#fff" }}>
              {["Task Type","Model","Provider","Context Window"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 13 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {routes.map((r, i) => (
              <tr key={r.task_type} style={{ background: i % 2 ? "#f8fafc" : "#fff" }}>
                <td style={{ padding: "10px 14px", fontWeight: 600 }}>{r.task_type}</td>
                <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 13 }}>{r.model_id}</td>
                <td style={{ padding: "10px 14px", color: "#64748b" }}>{r.provider}</td>
                <td style={{ padding: "10px 14px", color: "#64748b" }}>{r.context_window.toLocaleString()}</td>
              </tr>
            ))}
            {routes.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 20, color: "#94a3b8", textAlign: "center" }}>No routes loaded</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
