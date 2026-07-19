"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Plus, MessageSquare, Loader2, Cpu } from "lucide-react";

const AI_BASE = "http://localhost:8001/api/v1/ai";

const AGENTS = [
  { id: "ceo",       label: "CEO Agent",       icon: "👔", color: "#7c3aed" },
  { id: "cto",       label: "CTO Agent",       icon: "🔬", color: "#2563eb" },
  { id: "architect", label: "Architect",        icon: "🏗️", color: "#0891b2" },
  { id: "backend",   label: "Backend Eng",      icon: "⚙️", color: "#059669" },
  { id: "frontend",  label: "Frontend Eng",     icon: "🎨", color: "#d97706" },
  { id: "devops",    label: "DevOps",           icon: "🚀", color: "#dc2626" },
  { id: "tester",    label: "QA Tester",        icon: "🧪", color: "#7c3aed" },
  { id: "reviewer",  label: "Code Reviewer",    icon: "🔍", color: "#0891b2" },
  { id: "security",  label: "Security",         icon: "🛡️", color: "#dc2626" },
  { id: "data",      label: "Data Engineer",    icon: "🗃️", color: "#0f766e" },
  { id: "pm",        label: "Product Manager",  icon: "📋", color: "#9333ea" },
];

type Msg = { id: number; role: string; content: string; agent?: string; };

export default function ChatPage() {
  const [messages,   setMessages]   = useState<Msg[]>([]);
  const [input,      setInput]      = useState("");
  const [agentId,    setAgentId]    = useState("architect");
  const [streaming,  setStreaming]  = useState(false);
  const [streamText, setStreamText] = useState("");
  const [model,      setModel]      = useState("qwen2.5-coder:7b");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  const selectedAgent = AGENTS.find(a => a.id === agentId) ?? AGENTS[0];

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;
    const text = input.trim();
    setInput("");
    setStreaming(true);
    setStreamText("");

    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: text }]);

    try {
      const resp = await fetch(`${AI_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          agent: agentId,
          model: model,
          stream: true,
        }),
      });

      const reader  = resp.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        for (const line of text.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const d = JSON.parse(line.slice(6));
            if (d.token && !d.done) { full += d.token; setStreamText(full); }
            if (d.done) {
              setMessages(prev => [...prev, {
                id: Date.now() + 1, role: "assistant",
                content: full || streamText, agent: agentId,
              }]);
              setStreamText("");
              full = "";
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: "assistant",
        content: `Error: ${String(err)}`, agent: agentId,
      }]);
      setStreamText("");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 3rem)", gap: 16, padding: 16 }}>

      {/* Agent Selector Sidebar */}
      <div style={{
        width: 200, background: "#0f172a", border: "1px solid #1e293b",
        borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e293b",
          fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: 1 }}>
          SELECT AGENT
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {AGENTS.map(a => (
            <button key={a.id} onClick={() => setAgentId(a.id)}
              style={{
                width: "100%", textAlign: "left", padding: "8px 12px",
                borderRadius: 8, border: "none", cursor: "pointer",
                background: agentId === a.id ? a.color + "22" : "transparent",
                color: agentId === a.id ? a.color : "#94a3b8",
                fontWeight: agentId === a.id ? 700 : 400,
                fontSize: 13, marginBottom: 2,
                display: "flex", alignItems: "center", gap: 8,
                borderLeft: agentId === a.id ? `3px solid ${a.color}` : "3px solid transparent",
              }}>
              <span>{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: 12, borderTop: "1px solid #1e293b" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>Model</div>
          <select value={model} onChange={e => setModel(e.target.value)}
            style={{
              width: "100%", background: "#1e293b", color: "#94a3b8",
              border: "1px solid #334155", borderRadius: 6, padding: "4px 8px",
              fontSize: 11,
            }}>
            <option value="qwen2.5-coder:7b">qwen2.5-coder:7b</option>
            <option value="llama3.2:3b">llama3.2:3b</option>
            <option value="deepseek-r1:8b">deepseek-r1:8b</option>
          </select>
        </div>
      </div>

      {/* Chat Window */}
      <div style={{
        flex: 1, background: "#0f172a", border: "1px solid #1e293b",
        borderRadius: 12, display: "flex", flexDirection: "column",
      }}>

        {/* Header */}
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid #1e293b",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>{selectedAgent.icon}</span>
          <div>
            <div style={{ fontWeight: 700, color: "#f1f5f9" }}>{selectedAgent.label}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>
              RAG-grounded · {model}
            </div>
          </div>
          <button onClick={() => setMessages([])}
            style={{
              marginLeft: "auto", background: "#1e293b", border: "1px solid #334155",
              borderRadius: 8, padding: "6px 12px", color: "#94a3b8",
              fontSize: 12, cursor: "pointer",
            }}>
            <Plus style={{ width: 12, height: 12, display: "inline", marginRight: 4 }} />
            New
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.length === 0 && !streaming && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <div style={{ textAlign: "center", color: "#334155" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>{selectedAgent.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#475569" }}>{selectedAgent.label}</div>
                <div style={{ fontSize: 13, color: "#334155", marginTop: 8 }}>
                  Ask me anything · I use RAG + role context
                </div>
              </div>
            </div>
          )}

          {messages.map(m => (
            <div key={m.id} style={{
              display: "flex", gap: 12,
              flexDirection: m.role === "user" ? "row-reverse" : "row",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: m.role === "user" ? "#2563eb" : "#1e293b",
                fontSize: m.role === "user" ? 14 : 18,
              }}>
                {m.role === "user" ? "U" : (AGENTS.find(a => a.id === m.agent)?.icon ?? "🤖")}
              </div>
              <div style={{
                maxWidth: "70%", borderRadius: 12, padding: "12px 16px",
                background: m.role === "user" ? "#2563eb" : "#1e293b",
                color: "#f1f5f9", fontSize: 14, lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}>
                {m.content}
                {m.role === "assistant" && m.agent && (
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 6 }}>
                    {AGENTS.find(a => a.id === m.agent)?.label} · {model}
                  </div>
                )}
              </div>
            </div>
          ))}

          {streaming && (
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "#1e293b", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 18, flexShrink: 0,
              }}>
                {selectedAgent.icon}
              </div>
              <div style={{
                maxWidth: "70%", background: "#1e293b", borderRadius: 12,
                padding: "12px 16px", color: "#f1f5f9", fontSize: 14,
                lineHeight: 1.6, whiteSpace: "pre-wrap",
              }}>
                {streamText || "..."}
                <span style={{
                  display: "inline-block", width: 6, height: 14,
                  background: selectedAgent.color,
                  marginLeft: 2, animation: "pulse 1s infinite",
                }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: 16, borderTop: "1px solid #1e293b", display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder={`Ask ${selectedAgent.label}…`}
            style={{
              flex: 1, background: "#1e293b", color: "#f1f5f9",
              border: "1px solid #334155", borderRadius: 10,
              padding: "12px 16px", fontSize: 14,
              outline: "none",
            }}
          />
          <button onClick={sendMessage} disabled={streaming || !input.trim()}
            style={{
              background: streaming ? "#334155" : selectedAgent.color,
              border: "none", borderRadius: 10, padding: "12px 16px",
              color: "#fff", cursor: streaming ? "not-allowed" : "pointer",
              opacity: (!input.trim() || streaming) ? 0.5 : 1,
            }}>
            {streaming
              ? <Loader2 style={{ width: 18, height: 18 }} />
              : <Send style={{ width: 18, height: 18 }} />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
