"use client";

import { Settings, Server, Database, Cpu, Shield } from "lucide-react";

const config = [
  {
    section: "API Server",
    icon: Server,
    items: [
      { key: "URL", value: "http://localhost:8000" },
      { key: "Docs", value: "http://localhost:8000/docs" },
      { key: "Version", value: "0.1.0" },
    ],
  },
  {
    section: "Database",
    icon: Database,
    items: [
      { key: "PostgreSQL", value: "localhost:5432" },
      { key: "Database", value: "ai" },
      { key: "Qdrant", value: "localhost:6333" },
    ],
  },
  {
    section: "AI Models",
    icon: Cpu,
    items: [
      { key: "Ollama", value: "http://localhost:11434" },
      { key: "Embed Model", value: "bge-m3" },
      { key: "Default Model", value: "llama3.2:3b" },
    ],
  },
  {
    section: "Security",
    icon: Shield,
    items: [
      { key: "Auth", value: "JWT + API Keys" },
      { key: "Rate Limit", value: "60 req/min" },
      { key: "Token Expiry", value: "60 minutes" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Platform configuration overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {config.map(({ section, icon: Icon, items }) => (
          <div key={section} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Icon className="w-4 h-4 text-blue-400" /> {section}
            </h2>
            <div className="space-y-3">
              {items.map(({ key, value }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{key}</span>
                  <span className="text-xs text-gray-300 font-mono bg-gray-800 px-2 py-1 rounded">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4">
        <p className="text-xs text-yellow-400">
          ⚠️ This platform runs entirely locally. No data is sent to external services.
          All AI inference happens on your hardware via Ollama.
        </p>
      </div>
    </div>
  );
}
