// @ts-nocheck
"use client";
import { useState, useEffect } from "react";

interface CurrentUser {
  id: string;
  email: string;
  role: string;
  type: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin:   "Administrator",
  manager: "Manager",
  agent:   "Engineer",
  client:  "Client",
  viewer:  "Viewer",
};

const ROLE_COLORS: Record<string, string> = {
  admin:   "bg-red-100 text-red-800",
  manager: "bg-purple-100 text-purple-800",
  agent:   "bg-blue-100 text-blue-800",
  client:  "bg-slate-100 text-slate-600",
  viewer:  "bg-slate-100 text-slate-500",
};

export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    try {
      // Get token from cookie
      const token = document.cookie
        .split("; ")
        .find(row => row.startsWith("tb_access_token="))
        ?.split("=")[1];

      if (!token) return;

      // Decode JWT payload (base64)
      const parts = token.split(".");
      if (parts.length !== 3) return;
      const payload = JSON.parse(atob(parts[1]));
      setUser({
        id:    payload.sub || "",
        email: payload.email || "",
        role:  payload.role || "viewer",
        type:  payload.type || "access",
      });
    } catch {
      setUser(null);
    }
  }, []);

  return user;
}

export function useRole() {
  const user = useCurrentUser();
  return {
    role:      user?.role || "viewer",
    label:     ROLE_LABELS[user?.role || "viewer"] || user?.role || "—",
    color:     ROLE_COLORS[user?.role || "viewer"] || ROLE_COLORS.viewer,
    isAdmin:   user?.role === "admin",
    isManager: ["admin","manager"].includes(user?.role || ""),
    isEngineer:["admin","manager","agent"].includes(user?.role || ""),
    isFinance: ["admin","manager","finance"].includes(user?.role || ""),
    isClient:  user?.role === "client",
    canCreate: user?.role !== "client" && user?.role !== "viewer",
    canApprove:["admin","manager"].includes(user?.role || ""),
    canDelete: user?.role === "admin",
  };
}
