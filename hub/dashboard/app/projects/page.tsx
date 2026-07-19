export const dynamic = "force-dynamic";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

async function getData() {
  try {
    const res = await fetch(`${BASE}/api/v1/ai/projects`, { cache: "no-store" });
    const d = await res.json();
    return d.projects ?? [];
  } catch { return []; }
}

const STATUS_COLOR: Record<string,{bg:string,color:string}> = {
  active:   { bg:"#dcfce7", color:"#16a34a" },
  planning: { bg:"#dbeafe", color:"#2563eb" },
  paused:   { bg:"#fef9c3", color:"#ca8a04" },
  archived: { bg:"#f1f5f9", color:"#64748b" },
};

export default async function ProjectsPage() {
  const projects = await getData();
  const active = projects.filter((p:any) => p.status === "active").length;

  return (
    <main style={{ padding:32, maxWidth:1000, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:28, fontWeight:800, color:"#0f172a", margin:0 }}>🚀 Projects</h1>
        <p style={{ color:"#64748b", marginTop:4 }}>{projects.length} projects · {active} active</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px,1fr))", gap:16 }}>
        {projects.map((p: any, i: number) => {
          const s = STATUS_COLOR[p.status] ?? STATUS_COLOR.active;
          return (
            <div key={p.id ?? i} style={{
              background:"#fff", border:"1px solid #e2e8f0",
              borderRadius:12, padding:22,
              borderTop:`4px solid ${s.color}`,
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div style={{ fontWeight:700, fontSize:16, color:"#0f172a" }}>{p.name}</div>
                <span style={{
                  background:s.bg, color:s.color,
                  fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:99
                }}>{p.status ?? "active"}</span>
              </div>
              <div style={{ color:"#475569", fontSize:13, lineHeight:1.6, marginBottom:12 }}>
                {p.description ?? p.goal ?? "No description"}
              </div>
              {p.owner && (
                <div style={{ color:"#94a3b8", fontSize:12 }}>Owner: {p.owner}</div>
              )}
              <div style={{ color:"#94a3b8", fontSize:11, marginTop:8 }}>
                {p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}
              </div>
            </div>
          );
        })}
        {projects.length === 0 && (
          <div style={{ textAlign:"center", color:"#94a3b8", padding:48 }}>No projects yet</div>
        )}
      </div>
    </main>
  );
}
