import { hubGet } from "@/lib/hub";
import Link from "next/link";

type Workspace = {
  id: string; name: string; slug: string;
  description: string; status: string;
  portal_url: string; agents: string[];
  memory_enabled: boolean; data_enabled: boolean;
};

export default async function TriangleBlackPage() {
  const ws = await hubGet<Workspace>("/workspaces/triangle-black", {
    id: "triangle-black", name: "Triangle Black",
    slug: "triangle-black", description: "Loading...",
    status: "unknown", portal_url: "#",
    agents: [], memory_enabled: false, data_enabled: false,
  });

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-4 h-4 rounded-full bg-black border border-gray-600" />
        <h1 className="text-2xl font-bold">{ws.name}</h1>
        <span className={`text-xs px-2 py-1 rounded-full font-mono ${
          ws.status === "active" ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-400"
        }`}>{ws.status}</span>
      </div>

      <p className="text-gray-400 mb-8">{ws.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-xs text-gray-500 mb-1">PORTAL</div>
          <a href={ws.portal_url} target="_blank"
            className="text-blue-400 hover:underline text-sm font-mono">
            {ws.portal_url}
          </a>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-xs text-gray-500 mb-1">AGENTS</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {ws.agents.map(a => (
              <span key={a} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono">{a}</span>
            ))}
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-xs text-gray-500 mb-1">MEMORY</div>
          <span className="text-sm text-yellow-400">{ws.memory_enabled ? "Enabled" : "Disabled — clean slate"}</span>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="text-xs text-gray-500 mb-1">DATA</div>
          <span className="text-sm text-yellow-400">{ws.data_enabled ? "Enabled" : "Disabled — no data loaded"}</span>
        </div>
      </div>

      <Link href="/workspaces"
        className="text-sm text-gray-500 hover:text-gray-300">
        ← All Workspaces
      </Link>
    </main>
  );
}
