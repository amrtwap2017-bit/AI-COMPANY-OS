"use client";
// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageWrapper, PageHeader } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { authFetchJSON } from "@/lib/hooks/useAuthFetch";
import { tokenManager } from "@/lib/auth/token-manager";
import { User, Mail, Shield, Building2, LogOut, Key, Clock } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetchJSON("/api/v1/auth/me")
      .then(d => { setUser(d); setLoading(false); })
      .catch(() => {
        // Fallback: decode token
        const token = tokenManager.getToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]+"=="));
            setUser({ name: payload.name||"Admin", email: payload.email, role: payload.role });
          } catch {}
        }
        setLoading(false);
      });
  }, []);

  function handleLogout() {
    tokenManager.clearToken?.() || (() => {
      sessionStorage.removeItem("tb_access_token");
      localStorage.removeItem("tb_access_token");
    })();
    toast.success("Signed out");
    router.push("/login");
  }

  const initials = user?.name ? user.name.split(" ").map((n:string)=>n[0]).join("").toUpperCase().slice(0,2) : "TB";

  return (
    <PageWrapper>
      <Breadcrumb/>
      <PageHeader title="My Profile" subtitle="Account settings and preferences" badge="ME"/>
      <div className="max-w-2xl space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-600 flex items-center justify-center text-white font-bold text-xl">
              {loading ? "..." : initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name || "Loading..."}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full mt-1.5 inline-block capitalize">
                {user?.role || "—"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { icon: Mail,      label: "Email",   value: user?.email   || "—" },
              { icon: Shield,    label: "Role",    value: user?.role    || "—" },
              { icon: Building2, label: "Hotel",   value: user?.hotel   || "Triangle Black HQ" },
              { icon: Clock,     label: "Session", value: "Active" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <item.icon className="w-4 h-4 text-slate-400 flex-shrink-0"/>
                <span className="text-sm text-slate-500 w-20">{item.label}</span>
                <span className="text-sm font-medium text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Account Actions</h3>
          <div className="space-y-2">
            <button className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm text-slate-700 transition-colors">
              <Key className="w-4 h-4 text-slate-400"/> Change Password
              <span className="ml-auto text-xs text-slate-400">Coming soon</span>
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 rounded-xl border border-red-200 hover:bg-red-50 text-sm text-red-600 transition-colors">
              <LogOut className="w-4 h-4"/> Sign Out
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
