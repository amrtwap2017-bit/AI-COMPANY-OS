// @ts-nocheck
"use client";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronDown, Zap, User, LogOut, Settings, Search, Sun, Moon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { tokenManager } from "@/lib/auth/token-manager";
import { enterpriseCenters } from "./nav";
import { CommandBar } from "@/components/ui/CommandBar";
import { NotificationDrawer } from "@/components/ui/NotificationDrawer";
import { useTheme } from "@/lib/hooks/useTheme";

export function EnterpriseTopbar() {
  const [signalSummary, setSignalSummary] = useState({ critical: 0, high: 0, total: 0 });
  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/ai/signals/summary", { credentials: "include" });
      if (res.ok) { const data = await res.json(); setSignalSummary(data); }
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

  const { theme, toggleTheme, isDark } = useTheme();
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
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen(v => !v); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const ROLE_COLORS: Record<string,string> = {
    admin:"#B9924C", manager:"#B07A2A", agent:"#5B7C8C",
    engineer:"#547C4D", finance:"#8D7443", viewer:"#6D5F53"
  };
  const roleColor = ROLE_COLORS[user?.role||""] || "#6D5F53";

  return (
    <>
      <CommandBar open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} notifications={realNotifs} />

      <header
        className="h-14 flex items-center px-3 md:px-4 gap-2 md:gap-3 sticky top-0 z-30 flex-shrink-0"
        style={{background:"var(--color-topbar)",borderBottom:"1px solid var(--color-topbar-border)",boxShadow:"0 1px 0 rgba(0,0,0,0.04)"}}
      >
        {/* Brand mobile */}
        <Link href="/workspace" className="flex items-center gap-2 flex-shrink-0 lg:hidden">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"linear-gradient(135deg,#8F6F3D,#B9924C)"}}>
            <span style={{color:"#181614"}} className="font-bold text-xs">TB</span>
          </div>
        </Link>

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-1.5 text-sm flex-shrink-0" style={{color:"var(--color-topbar-text)",opacity:0.7}}>
          <Link href="/workspace" style={{color:"var(--color-topbar-text)",opacity:0.7,textDecoration:"none",fontSize:"0.875rem"}}>Home</Link>
          {activeCenter && (
            <>
              <span style={{opacity:0.4}}>/</span>
              <span style={{fontWeight:600,opacity:1}}>{activeCenter.label}</span>
            </>
          )}
        </div>

        {/* Search */}
        <button
          onClick={() => setCmdOpen(true)}
          className="hidden sm:flex flex-1 max-w-sm items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all group mx-2"
          style={{background:"rgba(0,0,0,0.04)",border:"1px solid rgba(0,0,0,0.08)",color:"var(--color-topbar-text)",opacity:0.6}}
        >
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 text-left text-sm">Search... ⌘K</span>
        </button>

        <div className="flex items-center gap-1 ml-auto">

          {/* Notifications */}
          <button
            onClick={() => { router.push("/notifications"); setUserOpen(false); }}
            className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{color:"var(--color-topbar-text)"}}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {signalSummary.critical > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{background:"#A84A3D"}}>
                {signalSummary.critical > 9 ? "9+" : signalSummary.critical}
              </span>
            )}
            {unreadCount > 0 && signalSummary.critical === 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{background:"#B9924C"}} />
            )}
          </button>

          {/* AI shortcut */}
          <Link
            href="/ai"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors"
            style={{background:"rgba(185,146,76,0.12)",border:"1px solid rgba(185,146,76,0.22)",color:"#B9924C"}}
          >
            <Zap className="w-3.5 h-3.5" />
            AI
          </Link>

            {/* Theme toggle — Obsidian Command / Ivory Operations */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:opacity-80"
              style={{color:"var(--color-topbar-text)"}}
              aria-label={isDark ? "Switch to Ivory Operations" : "Switch to Obsidian Command"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setUserOpen(v => !v); setNotifOpen(false); }}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-colors"
              style={{color:"var(--color-topbar-text)"}}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{background:`linear-gradient(135deg,${roleColor}80,${roleColor})`}}>
                <span style={{color:"#181614",fontSize:"0.6875rem",fontWeight:800}}>{initials}</span>
              </div>
              <span className="text-sm font-medium hidden md:block" style={{color:"var(--color-topbar-text)"}}>
                {user?.name?.split(" ")[0] || "User"}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userOpen ? "rotate-180" : ""}`} style={{color:"var(--color-topbar-text)",opacity:0.5}} />
            </button>

            {userOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-72 rounded-2xl overflow-hidden z-50"
                style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",boxShadow:"0 20px 40px rgba(0,0,0,0.12)"}}
              >
                {/* Identity block */}
                <div style={{padding:"16px 20px",borderBottom:"1px solid var(--color-divider)",background:"var(--color-surface-alt)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:40,height:40,borderRadius:10,background:`linear-gradient(135deg,${roleColor}60,${roleColor})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"1.1rem",fontWeight:900,color:"#181614"}}>
                      {initials}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:"0.9375rem",fontWeight:700,color:"var(--color-text-1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name || "User"}</div>
                      <div style={{fontSize:"0.75rem",color:"var(--color-text-3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.email || ""}</div>
                    </div>
                    <span style={{background:`${roleColor}15`,color:roleColor,border:`1px solid ${roleColor}30`,borderRadius:20,padding:"2px 10px",fontSize:"0.5625rem",fontWeight:700,textTransform:"uppercase",flexShrink:0}}>
                      {user?.role || "user"}
                    </span>
                  </div>
                </div>

                {/* Quick actions */}
                <div style={{padding:"8px"}}>
                  {[
                    {icon:"☀️", label:"My Day", desc:"Daily briefing + actions", path:"/workspace/my-day"},
                    {icon:"🔧", label:"My Work Orders", desc:"Assigned to me", path:"/operations/work-orders"},
                    {icon:"⏱", label:"Log Time", desc:"Record hours worked", path:"/operations/time-tracking"},
                    {icon:"📊", label:"Executive View", desc:"Platform KPIs", path:"/executive/dashboard"},
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={() => { setUserOpen(false); router.push(item.path); }}
                      style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"9px 12px",borderRadius:8,cursor:"pointer",textAlign:"left",background:"transparent",border:"none",transition:"background 120ms ease"}}
                      onMouseEnter={e=>e.currentTarget.style.background="var(--color-bg-alt)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                    >
                      <span style={{fontSize:"1rem",flexShrink:0,width:22,textAlign:"center"}}>{item.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}}>{item.label}</div>
                        <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)"}}>{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Settings + logout */}
                <div style={{padding:"8px",borderTop:"1px solid var(--color-divider)"}}>
                  {[
                    {icon:User, label:"My Profile", path:"/settings/profile"},
                    {icon:Settings, label:"Settings", path:"/settings/users"},
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={() => { setUserOpen(false); router.push(item.path); }}
                      style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:8,cursor:"pointer",textAlign:"left",background:"transparent",border:"none",transition:"background 120ms ease",fontSize:"0.8125rem",color:"var(--color-text-2)"}}
                      onMouseEnter={e=>e.currentTarget.style.background="var(--color-bg-alt)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                    >
                      <item.icon className="w-4 h-4" style={{color:"var(--color-text-3)"}} />
                      {item.label}
                    </button>
                  ))}
                  <button
                    onClick={() => { setUserOpen(false); logout(); }}
                    style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:8,cursor:"pointer",textAlign:"left",background:"transparent",border:"none",transition:"background 120ms ease",fontSize:"0.8125rem",color:"#A84A3D"}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(168,74,61,0.06)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
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
