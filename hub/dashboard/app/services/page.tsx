import { hubGet } from "@/lib/hub";
import Link from "next/link";

type Service = {
  id: string; name: string; port: number;
  url: string | null; status: string; ts: string;
};

const SERVICE_META: Record<string, { icon: string; color: string; link?: string }> = {
  n8n:       { icon: "⚡", color: "purple", link: "http://localhost:5678" },
  openwebui: { icon: "🤖", color: "blue",   link: "http://localhost:3400" },
  qdrant:    { icon: "🔍", color: "green",  link: "http://localhost:6333/dashboard" },
  postgres:  { icon: "🐘", color: "blue"  },
  redis:     { icon: "🔴", color: "red"   },
};

export default async function ServicesPage() {
  const data = await hubGet<{ services: Service[] }>(
    "/services",
    { services: [] }
  );

  const online = data.services.filter(s => s.status === "online").length;

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-gray-400 text-sm mt-1">
            Infrastructure & AI tools status
          </p>
        </div>
        <span className="text-sm font-mono bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
          {online}/{data.services.length} online
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.services.map(svc => {
          const meta = SERVICE_META[svc.id] ?? { icon: "⚙️", color: "gray" };
          return (
            <div key={svc.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5
                         hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{meta.icon}</span>
                  <div>
                    <div className="font-semibold text-sm">{svc.name}</div>
                    <div className="text-xs text-gray-500 font-mono">
                      :{svc.port}
                    </div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-mono ${
                  svc.status === "online"
                    ? "bg-green-900/50 text-green-400 border border-green-800"
                    : "bg-red-900/50 text-red-400 border border-red-800"
                }`}>
                  {svc.status === "online" ? "● LIVE" : "○ OFFLINE"}
                </span>
              </div>

              {meta.link && svc.status === "online" && (
                <a href={meta.link} target="_blank" rel="noreferrer"
                  className="text-xs text-blue-400 hover:underline font-mono">
                  Open → {meta.link}
                </a>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <a href="http://localhost:5678" target="_blank" rel="noreferrer"
          className="flex items-center gap-3 bg-purple-950/50 border border-purple-800
                     rounded-xl p-4 hover:bg-purple-900/50 transition-colors">
          <span className="text-3xl">⚡</span>
          <div>
            <div className="font-semibold">n8n Automation</div>
            <div className="text-xs text-gray-400">Workflow automation · port 5678</div>
          </div>
          <span className="ml-auto text-purple-400">→</span>
        </a>

        <a href="http://localhost:3400" target="_blank" rel="noreferrer"
          className="flex items-center gap-3 bg-blue-950/50 border border-blue-800
                     rounded-xl p-4 hover:bg-blue-900/50 transition-colors">
          <span className="text-3xl">🤖</span>
          <div>
            <div className="font-semibold">Open WebUI</div>
            <div className="text-xs text-gray-400">LLM chat interface · port 3400</div>
          </div>
          <span className="ml-auto text-blue-400">→</span>
        </a>
      </div>
    </main>
  );
}
