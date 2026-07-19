import { hubGet } from "@/lib/hub";

type Mem = { id: string; type: string; subject: string; content: string; created_at: string; };

const TYPE_COLORS: Record<string,string> = {
  failure:"#fee2e2", learning:"#dcfce7", execution:"#dbeafe",
  architecture:"#fef9c3", project:"#f3e8ff", conversation:"#f0fdf4",
};

export default async function MemoryPage({
  searchParams,
}: {
  searchParams: Promise<{ ws?: string }>;
}) {
  const params = await searchParams;
  const wsId = params.ws || "0d22ba37-30b0-46d9-844f-312ec5f9abc8";
  const data = await hubGet<{ memories: Mem[] }>(
    `/memory?workspace_id=${wsId}&limit=100`,
    { memories: [] }
  );
  const mems = data?.memories || [];

  const byType: Record<string,Mem[]> = {};
  mems.forEach((m) => {
    if (!byType[m.type]) byType[m.type] = [];
    byType[m.type].push(m);
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Memory</h1>
      <p style={{ color: "#64748b", marginTop: 4 }}>
        {mems.length} memories across {Object.keys(byType).length} types
      </p>
      <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
        {Object.entries(byType).map(([type, items]) => (
          <div key={type}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              {type.toUpperCase()} ({items.length})
            </h2>
            <div style={{ display: "grid", gap: 6 }}>
              {items.map((m) => (
                <div key={m.id} style={{
                  background: TYPE_COLORS[m.type] || "#f8fafc",
                  borderRadius: 8, padding: 10, fontSize: 13,
                }}>
                  <div style={{ fontWeight: 600 }}>{m.subject}</div>
                  <div style={{ color: "#374151", marginTop: 4 }}>{m.content}</div>
                  <div style={{ color: "#9ca3af", fontSize: 11, marginTop: 4 }}>
                    {String(m.created_at).slice(0,19)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {mems.length === 0 && <div style={{ color: "#94a3b8" }}>No memories yet.</div>}
      </div>
    </div>
  );
}
