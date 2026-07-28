"use client";
// @ts-nocheck
// RoleBadge — shows current user role from localStorage
import { useEffect, useState } from "react";

const ROLE_COLORS: Record<string, string> = {
  admin:      "#F87171",
  manager:    "#FB923C",
  engineer:   "#FBBF24",
  technician: "#34D399",
  finance:    "#60A5FA",
  viewer:     "#94A3B8",
  supplier:   "#A78BFA",
};

const ROLE_ICONS: Record<string, string> = {
  admin:      "👑",
  manager:    "📊",
  engineer:   "🔧",
  technician: "👷",
  finance:    "💰",
  viewer:     "👁️",
  supplier:   "🏭",
};

export function RoleBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const r = localStorage.getItem("tb_user_role") || "";
    setRole(r);
  }, []);

  if (!role) return null;

  const color = ROLE_COLORS[role] || "#94A3B8";
  const icon  = ROLE_ICONS[role]  || "👤";

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: size === "md" ? "4px 10px" : "2px 8px",
      borderRadius: 20,
      background: color + "18",
      border: "1px solid " + color + "40",
      color: color,
      fontSize: size === "md" ? "0.8125rem" : "0.6875rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    }}>
      <span style={{fontSize: size === "md" ? "0.875rem" : "0.75rem"}}>{icon}</span>
      {role}
    </span>
  );
}

export default RoleBadge;
