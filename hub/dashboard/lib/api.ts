/**
 * Hub Dashboard — API Client
 * Thin wrapper around fetch pointing to AI Engine (port 8001)
 */

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001") + "/api/v1/ai";

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API ${path} → ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return { data };
}

export const api = {
  get: <T = any>(path: string) =>
    request<T>(path, { method: "GET" }),

  post: <T = any>(path: string, body: unknown) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T = any>(path: string, body: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: <T = any>(path: string) =>
    request<T>(path, { method: "DELETE" }),
};

// ── Tools API (added for tools page) ─────────────────────────

export interface Tool {
  name:        string;
  description: string;
  category:    string;
  parameters?: Record<string, unknown>;
}

export interface ToolResult {
  success: boolean;
  output:  string;
  error?:  string;
  duration_ms?: number;
}

export async function getTools(): Promise<Tool[]> {
  try {
    const res = await fetch("/api/v1/ai/tools");
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [
      { name: "web_search",   description: "Search the web",          category: "research" },
      { name: "code_execute", description: "Execute Python code",      category: "code" },
      { name: "git_status",   description: "Get git repository status",category: "devops" },
      { name: "db_query",     description: "Query PostgreSQL database", category: "data" },
      { name: "file_read",    description: "Read a file",              category: "filesystem" },
    ];
  }
}

export async function getAgentTools(agentName: string): Promise<Tool[]> {
  try {
    const res = await fetch(`/api/v1/ai/agents/${agentName}/tools`);
    if (!res.ok) return getTools();
    return res.json();
  } catch {
    return getTools();
  }
}

export async function executeTool(
  toolName:  string,
  agentName: string,
  params:    Record<string, unknown> = {},
): Promise<ToolResult> {
  try {
    const res = await fetch("/api/v1/ai/tools/execute", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        tool:   toolName,
        agent:  agentName,
        params,
      }),
    });
    if (!res.ok) {
      return { success: false, output: "", error: `HTTP ${res.status}` };
    }
    return res.json();
  } catch (err) {
    return { success: false, output: "", error: String(err) };
  }
}
