"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { Send, Bot, User, Plus, MessageSquare, Loader2 } from "lucide-react";

const AGENTS = [
  "researcher", "writer", "planner", "analyst",
  "architect", "backend", "developer",
];

type Msg = {
  id: number; role: string; content: string;
  agent_name?: string | null; model_used?: string | null;
};
type Conv = {
  id: number; title: string | null; agent_name: string;
  message_count: number; created_at: string;
};

export default function ChatPage() {
  const [convos,      setConvos]      = useState<Conv[]>([]);
  const [activeId,    setActiveId]    = useState<number | null>(null);
  const [messages,    setMessages]    = useState<Msg[]>([]);
  const [input,       setInput]       = useState("");
  const [agent,       setAgent]       = useState("researcher");
  const [streaming,   setStreaming]   = useState(false);
  const [streamText,  setStreamText]  = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadConvos(); }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  const loadConvos = async () => {
    try {
      const r = await api.get("/conversations?limit=30");
      setConvos(r.data.conversations || []);
    } catch {}
  };

  const loadMessages = async (id: number) => {
    try {
      const r = await api.get(`/conversations/${id}/messages?limit=50`);
      setMessages(r.data.messages || []);
      setActiveId(id);
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;

    const text = input.trim();
    setInput("");
    setStreaming(true);
    setStreamText("");

    const tempMsg: Msg = {
      id: Date.now(), role: "user",
      content: text, agent_name: agent,
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = localStorage.getItem("token");

      const resp = await fetch(`${base}/api/v1/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text, agent,
          conversation_id: activeId,
          use_memory: true, use_knowledge: true,
        }),
      });

      const reader  = resp.body?.getReader();
      const decoder = new TextDecoder();
      let full      = "";
      let newId     = activeId;

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const d = JSON.parse(line.slice(6));
            if (d.token)            { full += d.token; setStreamText(full); }
            if (d.conversation_id)  { newId = d.conversation_id; setActiveId(d.conversation_id); }
          } catch {}
        }
      }

      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: full, agent_name: agent },
      ]);
      setStreamText("");
      if (newId) loadConvos();

    } catch (err) {
      setStreamText(`Error: ${String(err)}`);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex gap-4 h-full" style={{ height: "calc(100vh - 3rem)" }}>

      {/* Conversations */}
      <div className="w-52 flex-shrink-0 bg-gray-900 border border-gray-800 rounded-xl flex flex-col">
        <div className="p-3 border-b border-gray-800">
          <button onClick={() => { setActiveId(null); setMessages([]); }}
            className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600
                       hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> New chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {convos.map(c => (
            <button key={c.id} onClick={() => loadMessages(c.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors
                ${activeId === c.id ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800"}`}>
              <div className="flex items-center gap-1 mb-0.5">
                <MessageSquare className="w-3 h-3 flex-shrink-0" />
                <span className="font-medium truncate">{c.agent_name}</span>
              </div>
              <p className="truncate opacity-70">{c.title || "Chat"}</p>
              <p className="opacity-50">{c.message_count} msgs</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col bg-gray-900 border border-gray-800 rounded-xl">

        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          <Bot className="w-5 h-5 text-blue-400" />
          <select value={agent} onChange={e => setAgent(e.target.value)}
            className="bg-gray-800 text-gray-200 text-sm rounded px-2 py-1
                       border border-gray-700 focus:outline-none">
            {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <span className="text-xs text-gray-500 ml-auto">
            {activeId ? `Conv #${activeId}` : "New"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !streaming && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-600">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Start a conversation with {agent}</p>
              </div>
            </div>
          )}

          {messages.map(m => (
            <div key={m.id}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                ${m.role === "user" ? "bg-blue-600" : "bg-gray-700"}`}>
                {m.role === "user"
                  ? <User className="w-4 h-4" />
                  : <Bot  className="w-4 h-4" />}
              </div>
              <div className={`max-w-2xl rounded-xl px-4 py-3 text-sm
                ${m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-200"}`}>
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.agent_name && m.role === "assistant" && (
                  <p className="text-xs opacity-40 mt-1">{m.agent_name}</p>
                )}
              </div>
            </div>
          ))}

          {streaming && streamText && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="max-w-2xl bg-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200">
                <p className="whitespace-pre-wrap">{streamText}</p>
                <span className="inline-block w-1.5 h-4 bg-blue-400 animate-pulse ml-0.5" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-gray-800 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder={`Message ${agent}…`}
            className="flex-1 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl
                       px-4 py-3 text-sm border border-gray-700
                       focus:outline-none focus:border-blue-500"
          />
          <button onClick={sendMessage}
            disabled={streaming || !input.trim()}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700
                       disabled:opacity-50 text-white rounded-xl transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
