"use client";

import { useState, useRef, useEffect } from "react";

const AI_BASE = "http://localhost:8001/api/v1/ai";

const ENGINEERING_AGENTS = [
  { id: "architect", label: "Lead Architect",   icon: "🏗️", color: "#0891b2",
    hint: "System design, API patterns, ADRs, SOLID principles" },
  { id: "backend",   label: "Backend Engineer", icon: "⚙️", color: "#059669",
    hint: "FastAPI, PostgreSQL, SQLAlchemy, Python 3.12" },
  { id: "frontend",  label: "Frontend Engineer",icon: "🎨", color: "#d97706",
    hint: "Next.js 16, TypeScript, Tailwind, React Query" },
  { id: "devops",    label: "DevOps Engineer",  icon: "🚀", color: "#dc2626",
    hint: "Docker, WSL2, startup scripts, deployment" },
  { id: "reviewer",  label: "Code Reviewer",    icon: "🔍", color: "#7c3aed",
    hint: "CRITICAL/WARNING/SUGGESTION/APPROVED reviews" },
  { id: "security",  label: "Security Engineer",icon: "🛡️", color: "#be123c",
    hint: "OWASP Top 10, auth, secrets, vulnerability review" },
  { id: "tester",    label: "QA Engineer",      icon: "🧪", color: "#0f766e",
    hint: "Unit 70%, Integration 20%, E2E 10% testing" },
  { id: "data",      label: "Data Engineer",    icon: "🗃️", color: "#6d28d9",
    hint: "PostgreSQL, Qdrant vectors, migrations" },
];

const QUICK_PROMPTS = [
  { label: "Review for SQL injection",    msg: "Review this code for SQL injection: db.execute('SELECT * FROM users WHERE id=' + user_id)", agent: "reviewer" },
  { label: "Design a new API endpoint",   msg: "Design a REST endpoint for creating work orders with proper validation", agent: "architect" },
  { label: "Write a FastAPI route",       msg: "Write a FastAPI route for listing assets with pagination and filtering by status", agent: "backend" },
  { label: "Security audit checklist",    msg: "Give me an OWASP security checklist for our Triangle Black CRM system", agent: "security" },
  { label: "Test strategy for leads API", msg: "Write a test strategy for the leads API endpoint with unit and integration tests", agent: "tester" },
  { label: "Docker deployment steps",     msg: "What are the steps to deploy our FastAPI + Next.js stack to production?", agent: "devops" },
];

type Msg = { role: string; content: string; agent?: string; };

export default function EngineeringAIPage() {
  const [messages,   setMessages]   = useState<Msg[]>([]);
  const [input,      setInput]      = useState("");
  const [agentId,    setAgentId]    = useState("architect");
  const [streaming,  setStreaming]  = useState(false);
  const [streamText, setStreamText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const selectedAgent = ENGINEERING_AGENTS.find(a => a.id === agentId) ?? ENGINEERING_AGENTS[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  const send = async (msg?: string) => {
    const text = (msg ?? input).trim();
    if (!text || streaming) return;
    setInput("");
    setStreaming(true);
    setStreamText("");
    setMessages(prev => [...prev, { role: "user", content: text }]);

    try {
      const resp = await fetch(`${AI_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, agent: agentId, stream: true, model: "qwen2.5-coder:7b" }),
      });

      const reader  = resp.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const d = JSON.parse(line.slice(6));
            if (d.token && !d.done) { full += d.token; setStreamText(full); }
            if (d.done) {
              setMessages(prev => [...prev, { role: "assistant", content: full, agent: agentId }]);
              setStreamText(""); full = "";
            }
          } catch {}
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${e}`, agent: agentId }]);
      setStreamText("");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Engineering Center</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Engineering AI</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          RAG-grounded AI engineers with real skill knowledge.
          Each agent uses Triangle Black context + engineering skill files from the knowledge base.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-4">

        {/* Agent Selector */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Select Engineer</div>
          {ENGINEERING_AGENTS.map(a => (
            <button key={a.id} onClick={() => setAgentId(a.id)}
              className="w-full text-left p-3 rounded-xl border transition-all"
              style={{
                background: agentId === a.id ? a.color + "10" : "#fff",
                borderColor: agentId === a.id ? a.color : "#e2e8f0",
                borderLeft: agentId === a.id ? `4px solid ${a.color}` : "4px solid transparent",
              }}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{a.icon}</span>
                <div>
                  <div className="font-semibold text-sm text-slate-900">{a.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{a.hint}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Chat + Quick Prompts */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Quick Prompts */}
          <div className="grid grid-cols-2 gap-2">
            {QUICK_PROMPTS.map(qp => (
              <button key={qp.label}
                onClick={() => { setAgentId(qp.agent); send(qp.msg); }}
                disabled={streaming}
                className="text-left p-3 rounded-xl border border-slate-200 bg-white
                           hover:border-slate-400 hover:bg-slate-50 transition-all
                           text-xs text-slate-700 font-medium disabled:opacity-50">
                ⚡ {qp.label}
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
            style={{ height: 480 }}>

            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3"
              style={{ borderTop: `3px solid ${selectedAgent.color}` }}>
              <span className="text-2xl">{selectedAgent.icon}</span>
              <div>
                <div className="font-semibold text-slate-900">{selectedAgent.label}</div>
                <div className="text-xs text-slate-500">RAG-grounded · qwen2.5-coder:7b · {selectedAgent.hint}</div>
              </div>
              <button onClick={() => { setMessages([]); setStreamText(""); }}
                className="ml-auto text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded border border-slate-200">
                Clear
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !streaming && (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <div className="text-5xl mb-4">{selectedAgent.icon}</div>
                    <div className="font-semibold text-slate-700">{selectedAgent.label}</div>
                    <div className="text-sm text-slate-400 mt-2">
                      Ask me anything or use a quick prompt above
                    </div>
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{
                      background: m.role === "user" ? "#1B2B4B" : selectedAgent.color + "20",
                      color:      m.role === "user" ? "#fff"    : selectedAgent.color,
                    }}>
                    {m.role === "user" ? "U" : (ENGINEERING_AGENTS.find(a => a.id === m.agent)?.icon ?? "🤖")}
                  </div>
                  <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
                    ${m.role === "user"
                      ? "bg-[#1B2B4B] text-white"
                      : "bg-slate-50 border border-slate-200 text-slate-800"}`}>
                    {m.content}
                  </div>
                </div>
              ))}

              {streaming && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                    style={{ background: selectedAgent.color + "20" }}>
                    {selectedAgent.icon}
                  </div>
                  <div className="max-w-2xl bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 whitespace-pre-wrap">
                    {streamText || <span className="text-slate-400">Thinking…</span>}
                    <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse rounded-sm"
                      style={{ background: selectedAgent.color }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                placeholder={`Ask ${selectedAgent.label}…`}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:border-[#1B2B4B] text-slate-900"
              />
              <button onClick={() => send()} disabled={streaming || !input.trim()}
                className="px-5 py-3 rounded-xl text-white text-sm font-semibold transition-all
                           disabled:opacity-40"
                style={{ background: streaming ? "#94a3b8" : selectedAgent.color }}>
                {streaming ? "…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
