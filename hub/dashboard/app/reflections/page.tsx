export const dynamic = "force-dynamic";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

async function getData() {
  try {
    const res = await fetch(`${BASE}/api/v1/ai/reflections`, { cache: "no-store" });
    const d = await res.json();
    return d.reflections ?? [];
  } catch { return []; }
}

// Safe JSON parse — handles string OR already-parsed object
function safeParse(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return [String(val)]; }
}

export default async function ReflectionsPage() {
  const reflections = await getData();
  const successful = reflections.filter((r: any) => r.success).length;
  const avgScore = reflections.length > 0
    ? (reflections.reduce((s: number, r: any) => s + (Number(r.quality_score) || 0), 0) / reflections.length).toFixed(1)
    : "—";

  return (
    <main style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>🪞 Reflections</h1>
        <p style={{ color: "#64748b", marginTop: 4 }}>
          {reflections.length} reflections · {successful} successful · avg score {avgScore}
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
        {[
          { label:"Total", value: reflections.length, color:"#2563eb" },
          { label:"Successful", value: successful, color:"#16a34a" },
          { label:"Avg Score", value: avgScore, color:"#7c3aed" },
        ].map(k => (
          <div key={k.label} style={{
            background:"#fff", border:"1px solid #e2e8f0",
            borderRadius:12, padding:"16px 20px"
          }}>
            <div style={{ fontSize:28, fontWeight:800, color:k.color }}>{k.value}</div>
            <div style={{ color:"#64748b", fontSize:13 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {reflections.length === 0 && (
          <div style={{ textAlign:"center", color:"#94a3b8", padding:48 }}>No reflections yet</div>
        )}
        {reflections.map((r: any, i: number) => {
          const lessons      = safeParse(r.lessons);
          const improvements = safeParse(r.improvements);
          const score        = Number(r.quality_score) || 0;
          const scoreColor   = score >= 9 ? "#16a34a" : score >= 8 ? "#2563eb" : "#ca8a04";

          return (
            <div key={r.id ?? i} style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderLeft: `4px solid ${r.success ? "#16a34a" : "#dc2626"}`,
              borderRadius: 12,
              padding: 20,
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <span style={{ fontWeight:700, color:"#0f172a" }}>
                      {r.agent ?? r.agent_name ?? "Agent"}
                    </span>
                    <span style={{
                      background: r.success ? "#dcfce7" : "#fee2e2",
                      color: r.success ? "#16a34a" : "#dc2626",
                      fontSize:11, fontWeight:700, padding:"1px 8px", borderRadius:99
                    }}>{r.success ? "✓ success" : "✗ failed"}</span>
                    {r.speed_rating && (
                      <span style={{
                        background:"#f1f5f9", color:"#64748b",
                        fontSize:11, padding:"1px 8px", borderRadius:99
                      }}>{r.speed_rating}</span>
                    )}
                  </div>
                  <div style={{ color:"#475569", fontSize:14, lineHeight:1.6 }}>
                    {r.task ?? r.content ?? "No content"}
                  </div>
                  {r.model_used && (
                    <div style={{ color:"#94a3b8", fontSize:12, marginTop:4 }}>
                      {r.model_used}
                    </div>
                  )}
                </div>
                {score > 0 && (
                  <div style={{
                    background:"#f0fdf4", color: scoreColor,
                    fontWeight:800, fontSize:22,
                    padding:"6px 14px", borderRadius:10,
                    marginLeft:16, flexShrink:0, textAlign:"center"
                  }}>
                    {score.toFixed(1)}
                    <div style={{ fontSize:10, fontWeight:500, color:"#94a3b8" }}>score</div>
                  </div>
                )}
              </div>

              {lessons.length > 0 && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid #f1f5f9" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#2563eb", marginBottom:4 }}>
                    💡 LESSONS
                  </div>
                  {lessons.map((l: string, li: number) => (
                    <div key={li} style={{ fontSize:13, color:"#475569", marginBottom:2 }}>• {l}</div>
                  ))}
                </div>
              )}

              {improvements.length > 0 && (
                <div style={{ marginTop:8 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#7c3aed", marginBottom:4 }}>
                    🔧 IMPROVEMENTS
                  </div>
                  {improvements.map((imp: string, ii: number) => (
                    <div key={ii} style={{ fontSize:13, color:"#475569", marginBottom:2 }}>• {imp}</div>
                  ))}
                </div>
              )}

              <div style={{ color:"#94a3b8", fontSize:11, marginTop:10 }}>
                {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
