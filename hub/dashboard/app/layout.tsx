import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Engineering Hub",
  description: "Autonomous Engineering Platform",
};

const NAV = [
  { href: "/", label: "Runs" },
  { href: "/workspaces", label: "Workspaces" },
  { href: "/tasks", label: "Tasks" },
  { href: "/executions", label: "Executions" },
  { href: "/memory", label: "Memory" },
  { href: "/models", label: "Models" },
  { href: "/orchestrator", label: "🧠 Orchestrator" },
  { href: "/orchestrator/observability", label: "📡 Observability" },
  { href: "/triangle-black", label: "🏨 Triangle Black" },
  { href: "/tb-admin", label: "🏨 TB Admin" },
  { href: "/new-task", label: "+ New Task" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif", background: "#f9fafb" }}>
        <nav style={{ background: "#1e293b", padding: "10px 24px", display: "flex",
          gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>
            ⚙ AI Engineering Hub
          </span>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} style={{
              color: n.label.startsWith("+") ? "#4ade80"
                : n.label.startsWith("🧠") ? "#a78bfa"
                : n.label.startsWith("📡") ? "#38bdf8"
                : n.label.startsWith("🏨") ? "#fbbf24"
                : "#94a3b8",
              textDecoration: "none", fontSize: 13,
              fontWeight: n.label.startsWith("+") ||
                n.label.startsWith("🧠") ||
                n.label.startsWith("🏨") ||
                n.label.startsWith("📡") ? 700 : 400,
            }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
