"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

export default function SettingsPage() {
  const { data: profile } = useQuery(["settings-profile"], () => authFetch("/api/v1/auth/me").then(r => r.json()).catch(() => ({})));
  const { data: twin } = useQuery(["settings-twin"], () => authFetch("/api/v1/twin/state").then(r => r.json()).catch(() => ({})));

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="bg-white dark:bg-zinc-900 rounded-lg border p-6">
        <h2 className="font-semibold mb-4">Account</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Email</span><span>{profile?.email || "—"}</span></div>
          <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Role</span><span>{profile?.role || "admin"}</span></div>
          <div className="flex justify-between py-2 border-b"><span className="text-gray-500">User ID</span><span className="font-mono text-xs">{profile?.id || profile?.user_id || "—"}</span></div>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-lg border p-6">
        <h2 className="font-semibold mb-4">Platform</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Digital Twin Score</span><span className="font-bold">{twin?.health_score ?? "—"}/100</span></div>
          <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Health</span><span>{twin?.health_label || "—"}</span></div>
          <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Backend</span><span>http://localhost:8030</span></div>
          <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Portal</span><span>http://localhost:3000</span></div>
          <div className="flex justify-between py-2"><span className="text-gray-500">Version</span><span>2.0.1</span></div>
        </div>
      </div>
    </div>
  );
}
