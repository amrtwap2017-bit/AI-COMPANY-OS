"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/leads", label: "Leads", icon: "👥" },
  { href: "/pipeline", label: "Pipeline", icon: "📊" },
  { href: "/quotes", label: "Quotes", icon: "📄" },
  { href: "/agents", label: "Agents", icon: "🤝" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const path = usePathname();

  function logout() {
    localStorage.removeItem("tb_token");
    window.location.href = "/login";
  }

  return (
    <div style={{
      width: 220, background: "#0f172a", display: "flex",
      flexDirection: "column", padding: "24px 0", minHeight: "100vh",
      position: "sticky", top: 0, height: "100vh",
    }}>
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid #1e293b" }}>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>🏨 Triangle Black</div>
        <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>Hotel Platform</div>
      </div>

      <nav style={{ flex: 1, padding: "16px 0" }}>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 20px", textDecoration: "none",
            color: path === n.href ? "#fff" : "#94a3b8",
            background: path === n.href ? "#1e293b" : "transparent",
            borderLeft: path === n.href ? "3px solid #3b82f6" : "3px solid transparent",
            fontSize: 14, fontWeight: path === n.href ? 600 : 400,
            transition: "all 0.15s",
          }}>
            <span>{n.icon}</span>
            <span>{n.label}</span>
          </Link>
        ))}
      </nav>

      <div style={{ padding: "16px 20px", borderTop: "1px solid #1e293b" }}>
        <button onClick={logout} style={{
          width: "100%", padding: "8px 12px", background: "#1e293b",
          color: "#94a3b8", border: "none", borderRadius: 8,
          cursor: "pointer", fontSize: 13, textAlign: "left",
        }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
