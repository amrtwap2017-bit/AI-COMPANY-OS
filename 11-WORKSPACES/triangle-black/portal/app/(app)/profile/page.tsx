// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { tokenStore } from "@/lib/token-store";
import { User, Mail, Shield, Clock, LogOut, Key } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = tokenStore.get();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ email: payload.email, role: payload.role, id: payload.sub });
      } catch { setUser({ email: "dev@triangleblack.com", role: "admin" }); }
    } else {
      setUser({ email: "dev@triangleblack.com", role: "admin" });
    }
  }, []);

  function handleLogout() {
    tokenStore.clear();
    window.location.href = "/login";
  }

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb/>
      <PageHeader title="Profile" subtitle="Your account settings" badge="ME"/>
      <div className="max-w-2xl space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <User className="w-8 h-8 text-amber-600"/>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.email?.split("@")[0] || "User"}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold capitalize">{user?.role}</span>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { icon:Mail,    label:"Email",      value:user?.email },
              { icon:Shield,  label:"Role",       value:user?.role },
              { icon:Clock,   label:"Session",    value:"Active" },
            ].map(item=>(
              <div key={item.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <item.icon className="w-4 h-4 text-slate-400"/>
                <span className="text-sm text-slate-500 w-20">{item.label}</span>
                <span className="text-sm font-medium text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h3 className="font-semibold text-slate-900 mb-4">Actions</h3>
          <button className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm text-slate-700">
            <Key className="w-4 h-4"/> Change Password
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-xl border border-red-200 hover:bg-red-50 text-sm text-red-600">
            <LogOut className="w-4 h-4"/> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
