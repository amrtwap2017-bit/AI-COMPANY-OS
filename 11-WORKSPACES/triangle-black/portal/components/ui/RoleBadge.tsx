// @ts-nocheck
"use client";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

const ROLE_CONFIG: Record<string, {label:string; color:string; bg:string}> = {
  admin:   { label:"Admin",    color:"text-red-800",    bg:"bg-red-100 border-red-200" },
  manager: { label:"Manager",  color:"text-purple-800", bg:"bg-purple-100 border-purple-200" },
  agent:   { label:"Engineer", color:"text-blue-800",   bg:"bg-blue-100 border-blue-200" },
  client:  { label:"Client",   color:"text-slate-600",  bg:"bg-slate-100 border-slate-200" },
  viewer:  { label:"Viewer",   color:"text-secondary",  bg:"bg-slate-50 border-slate-200" },
};

export function RoleBadge({ className = "" }: { className?: string }) {
  const user = useCurrentUser();
  if (!user) return null;

  const config = ROLE_CONFIG[user.role] || ROLE_CONFIG.viewer;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.bg} ${config.color} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {config.label}
    </span>
  );
}

export function RoleGate({
  roles,
  children,
  fallback = null,
}: {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const user = useCurrentUser();
  if (!user) return fallback;
  if (!roles.includes(user.role)) return fallback;
  return children;
}
