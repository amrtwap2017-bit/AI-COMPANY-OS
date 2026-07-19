"use client";

import { useState, useRef, useEffect } from "react";

const AI = "http://localhost:8001/api/v1/ai";

const AGENTS = [
  { id: "ceo",       label: "CEO",           icon: "👔", color: "#7c3aed", desc: "Strategy & business" },
  { id: "architect", label: "Architect",      icon: "🏗️", color: "#0891b2", desc: "System design" },
  { id: "backend",   label: "Backend",        icon: "⚙️", color: "#059669", desc: "FastAPI & Python" },
  { id: "frontend",  label: "Frontend",       icon: "🎨", color: "#d97706", desc: "Next.js & UI" },
  { id: "reviewer",  label: "Code Review",    icon: "🔍", color: "#7c3aed", desc: "CRITICAL/WARNING/OK" },
  { id: "security",  label: "Security",       icon: "🛡️", color: "#dc2626", desc: "OWASP & vulnerabilities" },
  { id: "devops",    label: "DevOps",         icon: "🚀", color: "#ea580c", desc: "Docker & infrastructure" },
  { id: "tester",    label: "QA Tester",      icon: "🧪", color: "#0f766e", desc: "Test strategy" },
  { id: "data",      label: "Data Engineer",  icon: "🗃️", color: "#6d28d9", desc: "PostgreSQL & Qdrant" },
  { id: "pm",        label: "Product Manager",icon: "📋", color: "#9333ea", desc: "Roadmap & ICE scoring" },
  { id: "cto",       label: "CTO",            icon: "🔬", color: "#2563eb", desc: "Tech architecture" },
];

const QUICK = [
  { label: "SQL injection check",    agent: "reviewer",  msg: "Is this safe: db.execute('SELECT * FROM users WHERE id=' + user_id)" },
  { label: "Q3 priorities",          agent: "ceo",       msg: "What should be our top 3 priorities for Triangle Black this quarter?" },
  { label: "Paginate /tasks API?",   agent: "architect", msg: "Should the /tasks endpoint with 37 rows have pagination?" },
  { label: "OWASP audit",            agent: "security",  msg: "List the main security risks in our Triangle Black CRM system" },
  { label: "Test strategy",          agent: "tester",    msg: "Write a test strategy for the leads API endpoint" },
  { label: "Deploy checklist",       agent: "devops",    msg: "What do we need to deploy Triangle Black to production?" },
];

type Msg = { role: "user" | "assistant"; content: string; agent?: string; ts: string; };

function fmtTime(ts: string) {
  return new Date(ts).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const [msgs,      setMsgs]      = useState<Msg[]>([]);
  const [input,     setInput]     = useState("");
  const [agentId,   setAgentId]   = useState("architect");
  const [model,     setModel]     = useState("qwen2.5-coder:7b");
  const [streaming, setStreaming] = useState(false);
  const [streamTxt, setStreamTxt] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const agent = AGENTS.find(a => a.id === agentId) ?? AGENTS[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, streamTxt]);

  const send = async (overrideMsg?: string, overrideAgent?: string) => {
    const text  = (overrideMsg  ?? input).trim();
    const aId   = overrideAgent ?? agentId;
    const ag    = AGENTS.find(a => a.id === aId) ?? agent;
    if (!text || streaming) return;

    setInput("");
    setStreaming(true);
    setStreamTxt("");

    const userMsg: Msg = { role: "user", content: text, ts: new Date().toISOString() };
    setMsgs(prev => [...prev, userMsg]);

    try {
      const resp = await fetch(`${AI}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, agent: aId, model, stream: true }),
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
            if (d.token && !d.done) { full += d.token; setStreamTxt(full); }
            if (d.done) {
              setMsgs(prev => [...prev, {
                role: "assistant",
                content: full,
                agent: aId,
                ts: new Date().toISOString(),
              }]);
              setStreamTxt("");
              full = "";
              setStreaming(false);
            }
          } catch {}
        }
      }
    } catch (e) {
      setMsgs(prev => [...prev, {
        role: "assistant",
        content: `❌ Error: ${e}`,
        agent: aId,
        ts: new Date().toISOString(),
      }]);
      setStreamTxt("");
      setStreaming(false);
    }
  };

  const clear = () => { setMsgs([]); setStreamTxt(""); };

  return (
    <div style={{
      display: "flex", height: "calc(100vh - 80px)", gap: 16,
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    }}>

      {/* ── Left: Agent Picker ────────────────────────── */}
      <div style={{
        width: 210, flexShrink: 0,
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        <div style={{
          background: "#0f172a", border: "1px solid #1e293b",
          borderRadius: 12, overflow: "hidden",
        }}>
          <div style={{
            padding: "12px 14px", borderBottom: "1px solid #1e293b",
            fontSize: 11, fontWeight: 700, color: "#475569",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Select Agent
          </div>
          <div style={{ padding: 6, maxHeight: 400, overflowY: "auto" }}>
            {AGENTS.map(a => (
              <button key={a.id}
                onClick={() => setAgentId(a.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  gap: 8, padding: "8px 10px", borderRadius: 8,
                  border: "none", cursor: "pointer", marginBottom: 2,
                  background: agentId === a.id ? a.color + "18" : "transparent",
                  borderLeft: `3px solid ${agentId === a.id ? a.color : "transparent"}`,
                  textAlign: "left", transition: "all 0.12s",
                }}>
                <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{a.icon}</span>
                <div>
                  <div style={{
                    fontSize: 13, fontWeight: agentId === a.id ? 700 : 500,
                    color: agentId === a.id ? a.color : "#94a3b8",
                  }}>{a.label}</div>
                  <div style={{ fontSize: 10, color: "#475569" }}>{a.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Model selector */}
        <div style={{
          background: "#0f172a", border: "1px solid #1e293b",
          borderRadius: 12, padding: 12,
        }}>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 6,
            fontWeight: 700, textTransform: "uppercase" }}>Model</div>
          <select value={model} onChange={e => setModel(e.target.value)}
            style={{
              width: "100%", background: "#1e293b", color: "#94a3b8",
              border: "1px solid #334155", borderRadius: 6,
              padding: "5px 8px", fontSize: 11,
            }}>
            <option value="qwen2.5-coder:7b">qwen2.5-coder:7b</option>
            <option value="llama3.2:3b">llama3.2:3b</option>
            <option value="deepseek-r1:8b">deepseek-r1:8b</option>
          </select>
        </div>

        {/* Clear button */}
        <button onClick={clear}
          style={{
            background: "#1e293b", border: "1px solid #334155",
            borderRadius: 8, padding: "8px 12px",
            color: "#64748b", fontSize: 12, fontWeight: 600,
          }}>
          🗑 Clear Chat
        </button>
      </div>

      {/* ── Right: Chat ───────────────────────────────── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        background: "#0f172a", border: "1px solid #1e293b",
        borderRadius: 12, overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid #1e293b",
          display: "flex", alignItems: "center", gap: 12,
          background: "#020617",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: agent.color + "20",
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 20, flexShrink: 0,
          }}>
            {agent.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>
              {agent.label} Agent
            </div>
            <div style={{ fontSize: 11, color: "#475569" }}>
              RAG-grounded · {agent.desc} · {model}
            </div>
          </div>
          <div style={{
            marginLeft: "auto",
            width: 8, height: 8, borderRadius: "50%",
            background: streaming ? agent.color : "#16a34a",
            boxShadow: `0 0 6px ${streaming ? agent.color : "#16a34a"}`,
          }} />
        </div>

        {/* Quick prompts */}
        <div style={{
          padding: "10px 16px",
          borderBottom: "1px solid #1e293b",
          display: "flex", gap: 6, flexWrap: "wrap",
          background: "#020617",
        }}>
          {QUICK.map(q => (
            <button key={q.label}
              onClick={() => { setAgentId(q.agent); send(q.msg, q.agent); }}
              disabled={streaming}
              style={{
                background: "#1e293b", border: "1px solid #334155",
                borderRadius: 6, padding: "4px 10px",
                color: "#94a3b8", fontSize: 11, cursor: "pointer",
                opacity: streaming ? 0.5 : 1,
                transition: "all 0.12s",
              }}>
              ⚡ {q.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "20px 20px",
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          {msgs.length === 0 && !streaming && (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              height: "100%", gap: 12, color: "#334155",
            }}>
              <div style={{ fontSize: 56 }}>{agent.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#475569" }}>
                {agent.label} Agent
              </div>
              <div style={{ fontSize: 13, color: "#334155", textAlign: "center" }}>
                {agent.desc}<br />
                Ask anything or use a quick prompt above
              </div>
            </div>
          )}

          {msgs.map((m, i) => {
            const isUser = m.role === "user";
            const msgAgent = AGENTS.find(a => a.id === m.agent) ?? agent;
            return (
              <div key={i} style={{
                display: "flex",
                flexDirection: isUser ? "row-reverse" : "row",
                gap: 10, alignItems: "flex-start",
                animation: "fadeIn 0.2s ease",
              }}>
                {/* Avatar */}
                <div style={{
                  width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isUser ? "#2563eb" : msgAgent.color + "20",
                  fontSize: isUser ? 13 : 18, fontWeight: 700,
                  color: isUser ? "#fff" : msgAgent.color,
                }}>
                  {isUser ? "U" : msgAgent.icon}
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: "72%",
                  display: "flex", flexDirection: "column",
                  alignItems: isUser ? "flex-end" : "flex-start",
                  gap: 4,
                }}>
                  <div style={{
                    background: isUser ? "#2563eb" : "#1e293b",
                    color: "#f1f5f9",
                    borderRadius: isUser ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                    padding: "12px 16px",
                    fontSize: 14,
                    lineHeight: 1.65,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    border: isUser ? "none" : "1px solid #334155",
                  }}>
                    {m.content}
                  </div>
                  <div style={{ fontSize: 10, color: "#334155", padding: "0 4px" }}>
                    {isUser ? "You" : msgAgent.label} · {fmtTime(m.ts)}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Streaming bubble */}
          {streaming && (
            <div style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              animation: "fadeIn 0.2s ease",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: agent.color + "20", fontSize: 18,
              }}>
                {agent.icon}
              </div>
              <div style={{ maxWidth: "72%" }}>
                <div style={{
                  background: "#1e293b", color: "#f1f5f9",
                  border: "1px solid #334155",
                  borderRadius: "12px 12px 12px 4px",
                  padding: "12px 16px",
                  fontSize: 14, lineHeight: 1.65,
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                  minHeight: 44,
                }}>
                  {streamTxt || (
                    <span style={{ color: "#475569" }}>Thinking…</span>
                  )}
                  <span style={{
                    display: "inline-block", width: 7, height: 14,
                    background: agent.color, borderRadius: 2,
                    marginLeft: 3, verticalAlign: "middle",
                    animation: "pulse 0.8s ease infinite",
                  }} />
                </div>
                <div style={{ fontSize: 10, color: "#334155", marginTop: 4, padding: "0 4px" }}>
                  {agent.label} · typing…
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "14px 16px",
          borderTop: "1px solid #1e293b",
          background: "#020617",
          display: "flex", gap: 10, alignItems: "flex-end",
        }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Message ${agent.label}…`}
              disabled={streaming}
              style={{
                width: "100%",
                background: "#1e293b",
                color: "#f1f5f9",
                border: "1px solid #334155",
                borderRadius: 10,
                padding: "11px 16px",
                fontSize: 14,
                outline: "none",
                transition: "border 0.15s",
              }}
            />
          </div>
          <button
            onClick={() => send()}
            disabled={streaming || !input.trim()}
            style={{
              background: streaming || !input.trim() ? "#1e293b" : agent.color,
              border: "none", borderRadius: 10,
              width: 44, height: 44,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: streaming || !input.trim() ? "#475569" : "#fff",
              fontSize: 18, cursor: streaming || !input.trim() ? "not-allowed" : "pointer",
              transition: "all 0.15s", flexShrink: 0,
            }}>
            {streaming ? (
              <span style={{
                width: 16, height: 16, border: `2px solid #475569`,
                borderTopColor: agent.color, borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.8s linear infinite",
              }} />
            ) : "↑"}
          </button>
        </div>
      </div>
    </div>
  );
}
