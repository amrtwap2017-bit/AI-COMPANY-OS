// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useCallback, useEffect, useState } from "react";;
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronDown, Zap, User, LogOut, Settings, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { tokenManager } from "@/lib/auth/token-manager";
import { enterpriseCenters } from "./nav";
import { CommandBar } from "@/components/ui/CommandBar";
import { NotificationDrawer } from "@/components/ui/NotificationDrawer";

// Notifications loaded from real API
const MOCK_NOTIFICATIONS: any[] = [];

export function EnterpriseTopbar() {
  // Sprint 13: Live signal badge
  const [signalSummary, setSignalSummary] = useState({ critical: 0, high: 0, total: 0 });

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/ai/signals/summary", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSignalSummary(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 120000);
    return () => clearInterval(interval);
  }, [fetchSignals]);


  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [realNotifs, setRealNotifs] = useState<any[]>([]);
  const [notifBadge, setNotifBadge] = useState(0);
  useEffect(() => {
    // Fetch unread notification count
    const token = tokenManager.getToken() || "";
    if (token) {
      authFetch("/api/v1/platform-notif/?limit=5").then(r=>r.json()).then(d=>{
        setNotifBadge(d?.unread_count || 0);
        setRealNotifs((d?.notifications||[]).map((n:any)=>({
          id:n.id, type:n.type==="alert"?"error":n.type==="warning"?"warning":n.type==="success"?"success":"info",
          title:n.title, message:n.message, time:new Date(n.created_at).toLocaleDateString("en-GB"), read:n.is_read
        })));
      }).catch(()=>{});
    }
  }, []);
  useEffect(() => {
    const token = tokenManager.getToken() || "";
    if (!token) return;
    authFetch("/api/v1/notifications-portal?limit=20", {
      redirect: "follow",
      headers: { Authorization: "Bearer " + token }
    })
      .then(r => r.json())
      .then(d => {
        const items = Array.isArray(d) ? d : (d?.notifications ?? d?.items ?? []);
        setRealNotifs(items.map((n: any) => ({
          id:      n.id,
          type:    n.type === "warning" ? "warning" : n.type === "error" ? "error" : n.type === "success" ? "success" : "info",
          title:   n.title,
          message: n.message,
          time:    new Date(n.created_at).toLocaleDateString("en-GB"),
          read:    n.is_read ?? false,
        })));
      })
      .catch(() => {});
  }, []);

  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const activeCenter = enterpriseCenters.find(c => pathname.startsWith(c.href));
  const unreadCount = notifBadge || realNotifs.filter((n: any) => !n.read).length;
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "TB";


  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(v => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <CommandBar open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} notifications={realNotifs} />

      <header className="h-14 bg-surface border-b border-border flex items-center px-3 md:px-4 gap-2 md:gap-3 sticky top-0 z-30 flex-shrink-0" style={{boxShadow:"0 1px 0 rgba(255,255,255,0.05)"}}>
        {/* Brand mobile */}
        <Link href="/workspace" className="flex items-center gap-2 flex-shrink-0 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-amber-700 flex items-center justify-center">
            <span className="text-white font-bold text-xs">TB</span>
          </div>
        </Link>

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-1.5 text-sm text-tertiary flex-shrink-0">
          <Link href="/workspace" className="hover:text-primary transition-colors">Home</Link>
          {activeCenter && (
            <>
              <span className="text-tertiary">/</span>
              <span className="text-primary font-semibold">{activeCenter.label}</span>
            </>
          )}
        </div>

        {/* Mobile search icon - shows only on xs */}
        <button onClick={() => setCmdOpen(true)} className="sm:hidden w-8 h-8 rounded-xl hover:bg-base-alt flex items-center justify-center transition-colors flex-shrink-0">
          <Search className="w-4 h-4 text-secondary" />
        </button>
        {/* Command bar trigger */}
        <button
          onClick={() => setCmdOpen(true)}
          className="hidden sm:flex flex-1 max-w-sm items-center gap-2 px-3 py-1.5 bg-base-alt hover:bg-surface border border-border rounded-xl text-sm text-tertiary transition-all group mx-2"
        >
          <Search className="w-3.5 h-3.5 group-hover:text-amber-600 transition-colors" />
          <span className="flex-1 text-left text-tertiary text-sm">Search or run command...</span>
          <div className="flex items-center gap-0.5">
            <kbd className="text-xs bg-white border border-border text-tertiary px-1.5 py-0.5 rounded-md shadow-sm">⌘</kbd>
            <kbd className="text-xs bg-white border border-border text-tertiary px-1.5 py-0.5 rounded-md shadow-sm">K</kbd>
          </div>
        </button>

        <div className="flex items-center gap-1 ml-auto">
          {/* Notifications */}
          <button
            onClick={() => { router.push("/notifications"); setUserOpen(false); }}
            className="relative w-8 h-8 rounded-xl hover:bg-surface flex items-center justify-center transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-secondary" />
            {signalSummary.critical > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {signalSummary.critical > 9 ? "9+" : signalSummary.critical}
              </span>
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full border-2 border-white" />
            )}
          </button>

          {/* AI shortcut */}
          <Link
            href="/ai"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-semibold text-amber-700 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            AI
          </Link>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setUserOpen(v => !v); setNotifOpen(false); }}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-surface transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
              <span className="text-sm font-medium text-primary hidden md:block capitalize">
                {user?.name?.split(" ")[0] || "User"}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-tertiary transition-transform ${userOpen ? "rotate-180" : ""}`} />
            </button>

            {userOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-bold text-slate-900">{user?.name || "User"}</div>
                  <div className="text-xs text-tertiary">{user?.email || ""}</div>
                  <span className="inline-flex mt-1.5 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-semibold capitalize">
                    {user?.role || "user"}
                  </span>
                </div>
                {[{ icon: User, label: "My Profile" }, { icon: Settings, label: "Settings" }].map(item => (
                  <button
                    key={item.label}
                    onClick={() => { setUserOpen(false); router.push(item.label === "My Profile" ? "/profile" : "/settings"); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-base-alt transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-tertiary" />
                    {item.label}
                  </button>
                ))}
                <div className="border-t border-slate-100">
                  <button
                    onClick={() => { setUserOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
