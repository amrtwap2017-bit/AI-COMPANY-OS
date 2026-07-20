// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { PageHeader, PageWrapper } from "@/components/ui";
import { tokenManager } from "@/lib/auth/token-manager";
import { useAuth } from "@/lib/auth-context";
import { User, Mail, Shield, Clock, LogOut, Key } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    const token = tokenManager.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setTokenInfo(payload);
      } catch { /* ignore */ }
    }
  }, []);

  return (
    <PageWrapper>
      <PageHeader title="Profile" subtitle="Your account and session" badge="ME" />

      <div className="max-w-2xl space-y-4">
        {/* User card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
              <User className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name || "User"}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <span className="inline-flex mt-1.5 px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-semibold capitalize">
                {user?.role || "admin"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { icon: Mail,   label: "Email",   value: user?.email },
              { icon: Shield, label: "Role",    value: user?.role },
              { icon: Clock,  label: "Session", value: "Active" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <item.icon className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500 w-20">{item.label}</span>
                <span className="text-sm font-medium text-slate-900 capitalize">{item.value || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
          <h3 className="font-semibold text-slate-900 mb-4">Actions</h3>
          <button className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm text-slate-700 transition-colors">
            <Key className="w-4 h-4 text-slate-400" /> Change Password
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full p-3 rounded-xl border border-red-200 hover:bg-red-50 text-sm text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
