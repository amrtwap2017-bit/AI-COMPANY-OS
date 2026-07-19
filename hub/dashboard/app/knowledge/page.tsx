export const dynamic = "force-dynamic";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

async function getData() {
  try {
    const res = await fetch(`${BASE}/api/v1/ai/knowledge/documents`, { cache: "no-store" });
    const d = await res.json();
    return { docs: d.documents ?? [], total: d.total ?? 0 };
  } catch { return { docs: [], total: 0 }; }
}

const TYPE_COLOR: Record<string,string> = {
  markdown:"#7c3aed", text:"#2563eb", json:"#059669", code:"#d97706"
};

export default async function KnowledgePage() {
  const { docs, total } = await getData();

  return (
    <main style={{ padding: 32, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>🧠 Knowledge Base</h1>
        <p style={{ color: "#64748b", marginTop: 4 }}>
          {total} documents · 19 Qdrant collections · 125 vectors
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
        {[
          { label:"Documents",   value: total,    icon:"📄" },
          { label:"Collections", value: 19,       icon:"🗂️" },
          { label:"Vectors",     value: "125",    icon:"⚡" },
        ].map(s => (
          <div key={s.label} style={{
            background:"#fff", border:"1px solid #e2e8f0",
            borderRadius:12, padding:"16px 20px"
          }}>
            <div style={{ fontSize:28 }}>{s.icon}</div>
            <div style={{ fontSize:28, fontWeight:800, color:"#0f172a" }}>{s.value}</div>
            <div style={{ color:"#64748b", fontSize:13 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Documents */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {docs.map((doc: any, i: number) => (
          <div key={doc.id ?? i} style={{
            background:"#fff", border:"1px solid #e2e8f0",
            borderRadius:10, padding:"14px 18px",
            display:"flex", alignItems:"center", gap:14,
          }}>
            <span style={{ fontSize:20 }}>📄</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, color:"#0f172a" }}>{doc.title ?? doc.source ?? `Doc ${i+1}`}</div>
              {doc.source && <div style={{ color:"#64748b", fontSize:12 }}>{doc.source}</div>}
            </div>
            <span style={{
              background: `${TYPE_COLOR[doc.doc_type] ?? "#6366f1"}18`,
              color: TYPE_COLOR[doc.doc_type] ?? "#6366f1",
              fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:99
            }}>{doc.doc_type ?? "text"}</span>
          </div>
        ))}
        {docs.length === 0 && (
          <div style={{ textAlign:"center", color:"#94a3b8", padding:48 }}>No documents</div>
        )}
      </div>
    </main>
  );
}
