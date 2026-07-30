"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const fmtDate = (d) => {
  if (!d) return "—";
  try { const dt=new Date(d); if(dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); }
  catch { return "—"; }
};

const ROLE_COLORS = {
  admin:"#B9924C", manager:"#B07A2A", agent:"#5B7C8C",
  engineer:"#547C4D", finance:"#8D7443", viewer:"#6D5F53"
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const qc = useQueryClient();
  const [editPwd, setEditPwd] = useState(false);
  const [pwd, setPwd] = useState({current:"",new_:"",confirm:""});
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const { data: me } = useQuery(
    ["profile-me"],
    () => authFetch("/api/v1/me").then(r=>r.json()),
    { staleTime: 60000 }
  );

  const { data: auditRaw } = useQuery(
    ["profile-audit"],
    () => authFetch("/api/v1/audit-log/recent?limit=10&entity_type=user").then(r=>r.json()),
    { staleTime: 60000 }
  );

  const auditEvents = auditRaw?.events || [];
  const rc = ROLE_COLORS[me?.role || user?.role] || "#6D5F53";
  const initials = (user?.name || me?.name || "TB").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();

  const handlePasswordChange = async () => {
    if (pwd.new_ !== pwd.confirm) { setErr("Passwords do not match"); return; }
    if (pwd.new_.length < 6) { setErr("Password must be at least 6 characters"); return; }
    setErr(""); setMsg("Password change requires backend implementation");
  };

  return (
    <div className="min-h-screen" style={{background:"var(--color-bg)"}}>
      {/* Hero */}
      <div style={{background:"linear-gradient(140deg, #2A231E 0%, #332C27 40%, #3D352F 100%)",borderBottom:"1px solid rgba(185,146,76,0.12)",padding:"32px"}}>
        <div style={{maxWidth:1400,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:24}}>
            <div style={{width:72,height:72,borderRadius:16,background:`linear-gradient(135deg, ${rc}40, ${rc})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`2px solid ${rc}40`,fontSize:"1.5rem",fontWeight:900,color:"#F3EFE8"}}>
              {initials}
            </div>
            <div>
              <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:4}}>My Profile</div>
              <h1 style={{fontSize:"1.75rem",fontWeight:800,color:"#F3EFE8",letterSpacing:"-0.02em",margin:0}}>
                {user?.name || me?.name || "User"}
              </h1>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                <span style={{background:`${rc}20`,color:rc,border:`1px solid ${rc}40`,borderRadius:20,padding:"2px 10px",fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase"}}>
                  {me?.role || user?.role || "user"}
                </span>
                <span style={{color:"rgba(178,159,139,0.6)",fontSize:"0.8125rem"}}>{me?.email || user?.email}</span>
              </div>
            </div>
            <div style={{marginLeft:"auto",display:"flex",gap:12}}>
              <button onClick={()=>router.push("/settings/users")} style={{background:"rgba(185,146,76,0.1)",border:"1px solid rgba(185,146,76,0.25)",borderRadius:8,padding:"10px 20px",color:"#B9924C",fontSize:"0.875rem",fontWeight:600,cursor:"pointer"}}>
                Manage Users
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>

        {/* Account Info */}
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:20}}>Account Information</div>
          {[
            {label:"Full Name", value: user?.name || me?.name || "—"},
            {label:"Email", value: me?.email || user?.email || "—"},
            {label:"Role", value: me?.role || user?.role || "—"},
            {label:"User ID", value: (me?.user_id || me?.id || "—").slice(0,24)+"..."},
            {label:"Permissions", value: `${me?.permissions_count || 0} permissions`},
            {label:"Status", value: me?.is_active !== false ? "Active" : "Inactive"},
          ].map((row,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--color-divider)"}}>
              <span style={{fontSize:"0.8125rem",color:"var(--color-text-3)"}}>{row.label}</span>
              <span style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-1)"}}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Security */}
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:20}}>Security</div>
          <div style={{padding:16,background:"var(--color-bg-alt)",borderRadius:10,marginBottom:16}}>
            <div style={{fontSize:"0.875rem",fontWeight:600,color:"var(--color-text-1)",marginBottom:4}}>Password</div>
            <div style={{fontSize:"0.8125rem",color:"var(--color-text-3)"}}>Last changed: unknown</div>
          </div>
          {!editPwd ? (
            <button onClick={()=>setEditPwd(true)} style={{width:"100%",background:"rgba(185,146,76,0.08)",border:"1px solid rgba(185,146,76,0.22)",borderRadius:8,padding:"10px",color:"#B9924C",fontSize:"0.875rem",fontWeight:600,cursor:"pointer"}}>
              Change Password
            </button>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {[["Current Password","current"],["New Password","new_"],["Confirm New","confirm"]].map(([label,key])=>(
                <div key={key}>
                  <label style={{display:"block",fontSize:"0.75rem",color:"var(--color-text-3)",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600}}>{label}</label>
                  <input type="password" value={pwd[key]} onChange={e=>setPwd(p=>({...p,[key]:e.target.value}))}
                    style={{width:"100%",background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",borderRadius:6,padding:"10px 12px",color:"var(--color-text-1)",fontSize:"0.875rem",outline:"none",boxSizing:"border-box"}}/>
                </div>
              ))}
              {err && <div style={{color:"#A84A3D",fontSize:"0.8125rem"}}>{err}</div>}
              {msg && <div style={{color:"#547C4D",fontSize:"0.8125rem"}}>{msg}</div>}
              <div style={{display:"flex",gap:8}}>
                <button onClick={handlePasswordChange} style={{flex:1,background:"linear-gradient(135deg,#8F6F3D,#B9924C)",border:"none",borderRadius:6,padding:"10px",color:"#181614",fontSize:"0.875rem",fontWeight:700,cursor:"pointer"}}>Save</button>
                <button onClick={()=>setEditPwd(false)} style={{flex:1,background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",borderRadius:6,padding:"10px",color:"var(--color-text-2)",fontSize:"0.875rem",cursor:"pointer"}}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{marginTop:24,paddingTop:20,borderTop:"1px solid var(--color-divider)"}}>
            <button onClick={logout} style={{width:"100%",background:"rgba(168,74,61,0.08)",border:"1px solid rgba(168,74,61,0.22)",borderRadius:8,padding:"10px",color:"#A84A3D",fontSize:"0.875rem",fontWeight:600,cursor:"pointer"}}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Quick Access</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {icon:"🔧",label:"My Work Orders",path:"/operations/work-orders"},
              {icon:"⏱",label:"Time Tracking",path:"/operations/time-tracking"},
              {icon:"📊",label:"Executive Dashboard",path:"/executive/dashboard"},
              {icon:"👥",label:"User Management",path:"/settings/users"},
              {icon:"🔒",label:"Security Audit",path:"/settings/users"},
              {icon:"📜",label:"Audit Trail",path:"/administration/audit"},
            ].map((a,i)=>(
              <button key={i} onClick={()=>router.push(a.path)} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",borderRadius:8,cursor:"pointer",textAlign:"left",transition:"all 160ms ease"}}>
                <span>{a.icon}</span>
                <span style={{fontSize:"0.8125rem",fontWeight:500,color:"var(--color-text-2)"}}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
          <div style={{fontSize:"1rem",fontWeight:700,color:"var(--color-text-1)",marginBottom:16}}>Recent Activity</div>
          {auditEvents.length === 0 ? (
            <div style={{textAlign:"center",padding:"32px 0",color:"var(--color-text-3)",fontSize:"0.875rem"}}>No recent activity recorded</div>
          ) : auditEvents.map((e,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"8px 0",borderBottom:"1px solid var(--color-divider)"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#B9924C",flexShrink:0,marginTop:5}}/>
              <div>
                <div style={{fontSize:"0.8125rem",color:"var(--color-text-1)",fontWeight:500}}>{e.action} — {e.entity_type?.replace(/_/g," ")}</div>
                <div style={{fontSize:"0.75rem",color:"var(--color-text-3)",marginTop:1}}>{e.metadata || e.new_value || ""}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
