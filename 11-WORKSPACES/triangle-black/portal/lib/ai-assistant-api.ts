/**
 * Triangle Black — AI Assistant API
 * Wired to AI Engine on port 8001
 */

const AI_BASE = process.env.NEXT_PUBLIC_AI_URL ?? "http://127.0.0.1:8001/api/v1/ai";

async function aiRequest<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${AI_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`AI API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export const aiAssistantApi = {
  // RAG — ask question using brain knowledge
  ask: (question: string, domain?: string) =>
    aiRequest("/knowledge/rag", {
      method: "POST",
      body: JSON.stringify({
        query: question,
        top_k: 5,
        model: "qwen2.5-coder-32k:latest",
      }),
    }),

  // Semantic search over knowledge base
  search: (query: string) =>
    aiRequest("/knowledge/search", {
      method: "POST",
      body: JSON.stringify({ query, top_k: 5 }),
    }),

  // Get recommendations from knowledge base
  recommendations: () =>
    aiRequest("/knowledge/documents"),

  // Brain knowledge — all ingested files
  companyKnowledge: () =>
    aiRequest("/knowledge/documents"),

  // Chat with a specific agent
  chat: (message: string, agent = "researcher") =>
    aiRequest("/chat", {
      method: "POST",
      body: JSON.stringify({ message, agent, workspace: "triangle-black" }),
    }),

  // Get conversation history
  history: () =>
    aiRequest("/conversations?limit=20"),

  // Workspace info
  workspace: () =>
    aiRequest("/workspaces/triangle-black"),

  // Services status
  services: () =>
    aiRequest("/services"),

  // Health check
  health: () =>
    aiRequest("/health"),
};
