"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    group: "Command",
    items: [
      { href: "/",            icon: "🏠", label: "Dashboard" },
      { href: "/chat",        icon: "💬", label: "Agent Chat",   badge: "AI" },
      { href: "/agents",      icon: "🤖", label: "Agents" },
      { href: "/analytics",   icon: "📊", label: "Analytics" },
      { href: "/memory",      icon: "🧠", label: "Memory" },
    ],
  },
  {
    group: "Work",
    items: [
      { href: "/tasks",       icon: "✅", label: "Tasks" },
      { href: "/workflows",   icon: "⚙️", label: "Workflows" },
      { href: "/projects",    icon: "📁", label: "Projects" },
      { href: "/reflections", icon: "🔍", label: "Reflections" },
      { href: "/knowledge",   icon: "📚", label: "Knowledge" },
      { href: "/models",      icon: "🎛️", label: "Models" },
    ],
  },
  {
    group: "Triangle Black",
    items: [
      { href: "/triangle-black", icon: "🏨", label: "TB Dashboard" },
      { href: "/workspaces/triangle-black", icon: "🏢", label: "TB Workspace" },
      { href: "/tb-admin",       icon: "🔧", label: "TB Admin" },
    ],
  },
  {
    group: "Orchestrator",
    items: [
      { href: "/orchestrator",                 icon: "🧠", label: "Orchestrator" },
      { href: "/orchestrator/briefing",        icon: "📋", label: "Briefing" },
      { href: "/orchestrator/run-task",        icon: "▶️", label: "Run Task" },
      { href: "/orchestrator/observability",   icon: "📡", label: "Observability" },
      { href: "/runs",                         icon: "🏃", label: "Runs" },
      { href: "/executions",                   icon: "⚡", label: "Executions" },
    ],
  },
  {
    group: "Quick Actions",
    items: [
      { href: "/new-task",  icon: "➕", label: "New Task" },
      { href: "/settings",  icon: "⚙️", label: "Settings" },
    ],
  },
];

export default function Sidebar() {
  const path = usePathname();
  if (path === "/login" || path === "/register") return null;

  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: "#020617",
      borderRight: "1px solid #1e293b",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0, left: 0,
      zIndex: 50,
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{
        padding: "18px 16px 14px",
        borderBottom: "1px solid #1e293b",
      }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9",
          display: "flex", alignItems: "center", gap: 8 }}>
          <span>⚙</span> AI Company OS
        </div>
        <div style={{ fontSize: 10, color: "#334155", marginTop: 3 }}>
          v2.0.0 · Intelligent Platform
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px" }}>
        {NAV.map(group => (
          <div key={group.group} style={{ marginBottom: 12 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "#334155",
              textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "6px 8px 3px",
            }}>
              {group.group}
            </div>
            {group.items.map(item => {
              const active = path === item.href ||
                (item.href !== "/" && path.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 10px",
                    borderRadius: 7,
                    marginBottom: 1,
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? "#f1f5f9" : "#64748b",
                    background: active ? "#1e293b" : "transparent",
                    borderLeft: `3px solid ${active ? "#6366f1" : "transparent"}`,
                    transition: "all 0.12s",
                  }}>
                  <span style={{ fontSize: 14, width: 18, textAlign: "center", flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {(item as any).badge && (
                    <span style={{
                      fontSize: 9, background: "#1d4ed8", color: "#93c5fd",
                      padding: "1px 5px", borderRadius: 99, fontWeight: 700,
                    }}>
                      {(item as any).badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer links */}
      <div style={{
        padding: "10px 12px 14px",
        borderTop: "1px solid #1e293b",
        fontSize: 11,
      }}>
        <div style={{ color: "#334155", marginBottom: 4 }}>Quick Links</div>
        {[
          ["AI Engine API", "http://localhost:8001/docs"],
          ["TB Admin API",  "http://localhost:8030/docs"],
          ["TB Portal",     "http://localhost:3001"],
          ["OpenWebUI",     "http://localhost:3400"],
        ].map(([label, url]) => (
          <a key={url} href={url} target="_blank"
            style={{ display: "block", color: "#475569",
              textDecoration: "none", marginBottom: 2,
              fontSize: 11 }}
            onMouseOver={e => (e.currentTarget.style.color = "#6366f1")}
            onMouseOut={e => (e.currentTarget.style.color = "#475569")}>
            ↗ {label}
          </a>
        ))}
      </div>
    </aside>
  );
}
