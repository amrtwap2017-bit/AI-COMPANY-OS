"use client";
// @ts-nocheck
// Triangle Black — Technician Profile (Mobile)
// Sprint-018
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tbFetch } from "@/lib/api/tb-client";

export default function TechnicianProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    tbFetch("/api/v1/auth/me").then(r => r.json()).then(setProfile).catch(() => {});
  }, [mounted]);

  const handleLogout = () => {
    localStorage.removeItem("tb_access_token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-4">
        <h1 className="text-lg font-bold">Profile</h1>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-sm mx-auto">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
            {profile?.full_name?.[0] || profile?.email?.[0] || "T"}
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{profile?.full_name || profile?.email || "Technician"}</p>
            <p className="text-sm text-gray-400">{profile?.email || "—"}</p>
            <p className="text-xs text-blue-400 mt-1">Field Technician</p>
          </div>
        </div>

        {/* Info */}
        {profile && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
            {[
              ["Email",    profile.email],
              ["Role",     profile.role || "technician"],
              ["Hotel ID", profile.hotel_id],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="flex justify-between px-4 py-3">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xs text-white font-medium truncate max-w-40">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full py-3 bg-red-900 hover:bg-red-800 text-red-300 font-medium rounded-xl text-sm transition-colors border border-red-800">
          Sign Out
        </button>

        <p className="text-center text-xs text-gray-600">Triangle Black v3.0 — Field Portal</p>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex">
        {[
          { label: "Dashboard", icon: "🏠", path: "/technician-portal/dashboard" },
          { label: "Work Orders", icon: "🔧", path: "/technician-portal/work-orders" },
          { label: "Profile", icon: "👤", path: "/technician-portal/profile", active: true },
        ].map(item => (
          <button key={item.label} onClick={() => router.push(item.path)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs ${item.active ? "text-blue-400" : "text-gray-500"}`}>
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
