import { hubGet } from "@/lib/hub";
import Link from "next/link";

type Workspace = { id: string; name: string; slug: string; status: string };

export default async function WorkspacesPage() {
  const data = await hubGet<{ workspaces: Workspace[] }>("/workspaces", { workspaces: [] });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Workspaces</h1>
      <p style={{ color: "#64748b", marginTop: 4 }}>Every company is a workspace.</p>
      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {(data?.workspaces || []).map((w) => (
          <div key={w.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{w.name}</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>slug: {w.slug} · status: {w.status}</div>
              </div>
              <Link href={`/tasks?ws=${w.id}`} style={{ fontSize: 13, color: "#3b82f6" }}>View Tasks →</Link>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8" }}>{w.id}</div>
          </div>
        ))}
        {(!data?.workspaces || data.workspaces.length === 0) && (
          <div style={{ color: "#94a3b8" }}>No workspaces yet.</div>
        )}
      </div>
    </div>
  );
}
