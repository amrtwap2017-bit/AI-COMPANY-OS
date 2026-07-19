import { hubGet } from "@/lib/hub";
import { createAndOrchestrateTask } from "./actions";

type Workspace = { id: string; name: string; slug: string; status: string };

export default async function NewTaskPage() {
  const data = await hubGet<{ workspaces: Workspace[] }>("/workspaces", { workspaces: [] });
  const workspaces = data?.workspaces || [];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Create Task</h1>
      <p style={{ color: "#64748b", marginTop: 4 }}>
        Type a requirement. The OS will decompose it into subtasks and execute autonomously.
      </p>

      <form action={createAndOrchestrateTask}
        style={{ marginTop: 24, display: "grid", gap: 16, background: "#fff", padding: 24, borderRadius: 12, border: "1px solid #e2e8f0" }}>

        <div>
          <label style={{ fontWeight: 600, fontSize: 14, display: "block", marginBottom: 6 }}>Workspace</label>
          <select name="workspace_id" required
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14 }}>
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>{w.name} ({w.slug})</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 600, fontSize: 14, display: "block", marginBottom: 6 }}>Task Title</label>
          <input name="title" required placeholder="e.g. CRE-002: Lead Qualification Engine"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" }} />
        </div>

        <div>
          <label style={{ fontWeight: 600, fontSize: 14, display: "block", marginBottom: 6 }}>Description</label>
          <textarea name="description" rows={4}
            placeholder="Describe what needs to be built. Include context, constraints, tech stack requirements."
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", resize: "vertical" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: 14, display: "block", marginBottom: 6 }}>Type</label>
            <select name="type" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14 }}>
              <option value="feature">Feature (auto-decomposes)</option>
              <option value="epic">Epic (auto-decomposes)</option>
              <option value="story">Story (auto-decomposes)</option>
              <option value="task">Task (executes directly)</option>
              <option value="code">Code Task</option>
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: 14, display: "block", marginBottom: 6 }}>Priority</label>
            <select name="priority" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14 }}>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontWeight: 600, fontSize: 14, display: "block", marginBottom: 6 }}>
            Acceptance Criteria <span style={{ color: "#94a3b8", fontWeight: 400 }}>(one per line)</span>
          </label>
          <textarea name="acceptance_criteria" rows={4}
            placeholder={"Lead stored in database\nAgent assigned automatically\nDashboard shows lead status\nAPI tests pass"}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", resize: "vertical" }} />
        </div>

        <button type="submit"
          style={{
            padding: "12px 24px", background: "#1e293b", color: "#fff",
            borderRadius: 8, border: "none", fontSize: 15, fontWeight: 700,
            cursor: "pointer", width: "100%",
          }}>
          ⚡ Create Task + Orchestrate Autonomously
        </button>
      </form>

      <div style={{ marginTop: 20, padding: 16, background: "#f0fdf4", borderRadius: 8, fontSize: 13, color: "#166534" }}>
        <strong>What happens:</strong> Task is created → Planner decomposes into subtasks →
        Each subtask assigned to correct agent + model → Ready for execution
      </div>
    </div>
  );
}
