export const dynamic = "force-dynamic";

const TB = "http://127.0.0.1:8030/api/v1";
const AI = "http://127.0.0.1:8001/api/v1/ai";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

async function getLeads() {
  return safe(async () => {
    const r = await fetch(`${TB}/leads/`, { cache: "no-store" });
    return r.ok ? r.json() : [];
  }, []);
}

async function getWorkOrders() {
  return safe(async () => {
    const r = await fetch(`${TB}/work-orders/`, { cache: "no-store" });
    return r.ok ? r.json() : [];
  }, []);
}

async function getTechnicians() {
  return safe(async () => {
    const r = await fetch(`${TB}/technicians/`, { cache: "no-store" });
    return r.ok ? r.json() : [];
  }, []);
}

async function getAssets() {
  return safe(async () => {
    const r = await fetch(`${TB}/assets/`, { cache: "no-store" });
    return r.ok ? r.json() : [];
  }, []);
}

async function getInventory() {
  return safe(async () => {
    const r = await fetch(`${TB}/inventory/items/`, { cache: "no-store" });
    return r.ok ? r.json() : [];
  }, []);
}

async function getAnalytics() {
  return safe(async () => {
    const r = await fetch(`${AI}/analytics/summary`, { cache: "no-store" });
    return r.ok ? r.json() : {};
  }, {});
}

const STATUS_COLOR: Record<string, string> = {
  new: "#3b82f6", qualified: "#16a34a", negotiation: "#d97706",
  won: "#059669", lost: "#dc2626",
  pending: "#d97706", "in-progress": "#3b82f6", completed: "#16a34a",
  active: "#16a34a", inactive: "#64748b",
};

export default async function TriangleBlackPage() {
  const [leads, workOrders, technicians, assets, inventory, analytics] = await Promise.all([
    getLeads(), getWorkOrders(), getTechnicians(), getAssets(), getInventory(), getAnalytics()
  ]);

  const leadArr  = Array.isArray(leads)      ? leads      : [];
  const woArr    = Array.isArray(workOrders) ? workOrders : [];
  const techArr  = Array.isArray(technicians)? technicians: [];
  const assetArr = Array.isArray(assets)     ? assets     : [];
  const invArr   = Array.isArray(inventory)  ? inventory  : [];

  const tbOnline = leadArr.length > 0 || woArr.length > 0;

  const Stat = ({ label, value, sub, color = "#6366f1" }: any) => (
    <div style={{
      background: "#0f172a", border: `1px solid #1e293b`,
      borderTop: `3px solid ${color}`,
      borderRadius: 12, padding: "20px 24px", minWidth: 140,
    }}>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 800, color: "#f1f5f9" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{sub}</div>}
    </div>
  );

  const Badge = ({ label, color }: any) => (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}44`,
      fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 700,
    }}>{label}</span>
  );

  return (
    <div style={{ maxWidth: 1100, padding: 32, color: "#f1f5f9" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>🏨 Triangle Black</h1>
          <div style={{ color: "#64748b", marginTop: 4, fontSize: 13 }}>
            Hotel Engineering Services · Egypt · CRM + Service Operations
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge label={tbOnline ? "● TB LIVE" : "● TB OFFLINE"} color={tbOnline ? "#16a34a" : "#dc2626"} />
          <a href="http://localhost:3001" target="_blank" style={{ color: "#60a5fa", fontSize: 12 }}>Portal ↗</a>
          <a href="http://localhost:8030/docs" target="_blank" style={{ color: "#60a5fa", fontSize: 12 }}>API ↗</a>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
        <Stat label="Leads" value={leadArr.length} sub="pipeline" color="#3b82f6" />
        <Stat label="Work Orders" value={woArr.length} sub="service ops" color="#d97706" />
        <Stat label="Technicians" value={techArr.length} sub="field team" color="#16a34a" />
        <Stat label="Assets" value={assetArr.length} sub="tracked" color="#8b5cf6" />
        <Stat label="Inventory" value={invArr.length} sub="items" color="#ec4899" />
        <Stat label="AI Tasks" value={(analytics as any).total_tasks ?? 0} sub="in engine" color="#06b6d4" />
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Leads Pipeline */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            <span>📊 Leads Pipeline</span>
            <a href="http://localhost:3001/leads" target="_blank" style={{ color: "#60a5fa", fontSize: 12, fontWeight: 400 }}>View all ↗</a>
          </div>
          {leadArr.length === 0 ? (
            <div style={{ color: "#475569", fontSize: 13 }}>No leads data</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {leadArr.map((lead: any) => (
                <div key={lead.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "#1e293b", borderRadius: 8, padding: "10px 14px",
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{lead.name || lead.company_name || `Lead #${lead.id}`}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{lead.company || lead.email || ""}</div>
                  </div>
                  <Badge
                    label={lead.status || "new"}
                    color={STATUS_COLOR[lead.status] || "#6366f1"}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Work Orders */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            <span>🔧 Work Orders</span>
            <a href="http://localhost:3001/work-orders" target="_blank" style={{ color: "#60a5fa", fontSize: 12, fontWeight: 400 }}>View all ↗</a>
          </div>
          {woArr.length === 0 ? (
            <div style={{ color: "#475569", fontSize: 13 }}>No work orders</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {woArr.map((wo: any) => (
                <div key={wo.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "#1e293b", borderRadius: 8, padding: "10px 14px",
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{wo.title || wo.description?.slice(0, 40) || `WO #${wo.id}`}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{wo.service_type || wo.type || ""}</div>
                  </div>
                  <Badge
                    label={wo.status || "pending"}
                    color={STATUS_COLOR[wo.status] || "#d97706"}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Technicians */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>👷 Field Team</div>
          {techArr.length === 0 ? (
            <div style={{ color: "#475569", fontSize: 13 }}>No technicians data</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {techArr.map((tech: any) => (
                <div key={tech.id} style={{
                  background: "#1e293b", borderRadius: 8, padding: "10px 14px",
                }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>👤 {tech.name || `Tech #${tech.id}`}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{tech.specialty || tech.role || "Technician"}</div>
                  <Badge label={tech.status || "active"} color={STATUS_COLOR[tech.status] || "#16a34a"} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Intelligence Panel */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>🤖 AI Intelligence</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["Tasks", (analytics as any).total_tasks ?? 0],
              ["Agents", (analytics as any).active_agents ?? 0],
              ["Memories", (analytics as any).total_memories ?? 0],
              ["Chats", (analytics as any).total_conversations ?? 0],
            ].map(([label, val]) => (
              <div key={label as string} style={{
                background: "#1e293b", borderRadius: 8, padding: "10px 14px", textAlign: "center",
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#818cf8" }}>{val}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              ["🏨 TB Portal", "http://localhost:3001"],
              ["⚙️ TB Admin API", "http://localhost:8030/docs"],
              ["🤖 AI Engine", "http://localhost:8001/docs"],
            ].map(([label, url]) => (
              <a key={url as string} href={url as string} target="_blank"
                style={{ color: "#60a5fa", fontSize: 12, textDecoration: "none" }}>
                {label} ↗
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
