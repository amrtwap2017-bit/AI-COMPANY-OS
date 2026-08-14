"use client";
// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/lib/toast";

const fmtDate = (d) => { if (!d) return "—"; try { const dt=new Date(d); if(dt.getFullYear()<1990) return "—"; return dt.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); } catch { return "—"; } };
const ROLE_COLORS = { admin:"#B9924C",manager:"#B07A2A",agent:"#5B7C8C",engineer:"#547C4D",finance:"#8D7443",viewer:"#6D5F53" };

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [editPwd, setEditPwd] = useState(false);
  const [pwd, setPwd] = useState({ current:"", new_:"", confirm:"" });
  const [pwdErrors, setPwdErrors] = useState({});

  const { data: me } = useQuery({ queryKey:["profile-me"], queryFn:()=>authFetch("/api/v1/me").then(r=>r.json()), staleTime:60000 });

  const rc = ROLE_COLORS[me?.role||user?.role] || "#6D5F53";
  const initials = (user?.name||me?.name||"TB").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  const displayName = user?.name||me?.name||"User";
  const displayEmail = user?.email||me?.email||"—";
  const displayRole = me?.role||user?.role||"—";

  const changePwdMut = useMutation({
    mutationFn: (payload) => authFetch("/api/v1/secure/auth/change-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}).then(r=>r.json()),
    onSuccess: (data) => {
      if (data?.success) { toast.success("Password changed successfully"); setPwd({current:"",new_:"",confirm:""}); setPwdErrors({}); setEditPwd(false); }
      else { toast.error(data?.detail||"Password change failed"); if (data?.detail?.toLowerCase().includes("current")) setPwdErrors({current:"Current password is incorrect"}); }
    },
    onError: () => toast.error("Network error — please try again"),
  });

  const handlePasswordChange = () => {
    const e = {};
    if (!pwd.current) e.current = "Current password is required";
    if (!pwd.new_) e.new_ = "New password is required";
    else if (pwd.new_.length < 8) e.new_ = "Minimum 8 characters";
    if (!pwd.confirm) e.confirm = "Please confirm new password";
    else if (pwd.new_ !== pwd.confirm) e.confirm = "Passwords do not match";
    if (Object.keys(e).length) { setPwdErrors(e); return; }
    changePwdMut.mutate({ current_password:pwd.current, new_password:pwd.new_ });
  };

  const handleLogout = () => { logout?.(); router.push("/login"); };
  const setP = (k,v) => { setPwd(p=>({...p,[k]:v})); if (pwdErrors[k]) setPwdErrors(e=>{const n={...e};delete n[k];return n;}); };

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-sidebar flex-shrink-0"
                style={{background:`linear-gradient(135deg,${rc}60,${rc})`,border:`2px solid ${rc}40`}}>
                {initials}
              </div>
              <div>
                <div className="text-label-upper text-brand mb-1.5">My Profile</div>
                <h1 className="tb-hero-title">{displayName}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-secondary">{displayEmail}</span>
                  <span className="tb-badge" style={{background:`${rc}18`,color:rc,borderColor:`${rc}30`}}>
                    {displayRole.charAt(0).toUpperCase()+displayRole.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="tb-btn tb-btn-danger">Sign Out</button>
          </div>
          <div className="tb-grid-4 mt-6">
            <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{fontSize:"14px"}}>{me?.id?.slice(0,8)||"—"}</div><div className="tb-hero-kpi-label">User ID</div></div>
            <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{fontSize:"14px",color:rc}}>{displayRole}</div><div className="tb-hero-kpi-label">Role</div></div>
            <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{fontSize:"14px"}}>{fmtDate(me?.created_at)}</div><div className="tb-hero-kpi-label">Member Since</div></div>
            <div className="tb-hero-kpi"><div className="tb-hero-kpi-value" style={{color:"var(--color-success)",fontSize:"14px"}}>Active</div><div className="tb-hero-kpi-label">Account Status</div></div>
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="tb-grid-2" style={{alignItems:"start"}}>

          <div className="flex flex-col gap-4">
            <div className="tb-section">
              <div className="tb-section-title">Account Information</div>
              {[["Full Name",displayName],["Email",displayEmail],["Role",displayRole],["Hotel ID",me?.hotel_id||"—"],["User ID",me?.id||"—"],["Member Since",fmtDate(me?.created_at)],["Last Updated",fmtDate(me?.updated_at)]].map(([label,value],i,arr)=>(
                <div key={i} className="tb-detail-row">
                  <span className="tb-detail-key">{label}</span>
                  <span className="tb-detail-value" style={{wordBreak:"break-all"}}>{value}</span>
                </div>
              ))}
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Quick Navigation</div>
              <div className="flex flex-col gap-2">
                {[{label:"Audit Trail",icon:"🔍",path:"/administration/audit"},{label:"My Work Orders",icon:"🔧",path:"/operations/work-orders"},{label:"Time Tracking",icon:"⏱",path:"/operations/time-tracking"},{label:"Dashboard",icon:"📊",path:"/workspace"}].map((a,i)=>(
                  <button key={i} onClick={()=>router.push(a.path)} className="tb-action-item">
                    <span>{a.icon}</span><span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="tb-section">
              <div className="flex justify-between items-center mb-4">
                <div className="tb-section-title" style={{margin:0}}>Security</div>
                {!editPwd && <button onClick={()=>setEditPwd(true)} className="tb-btn tb-btn-primary tb-btn-sm">Change Password</button>}
              </div>

              {!editPwd ? (
                <div className="flex items-center gap-3 p-4 bg-surface-alt border border-default rounded-lg">
                  <span className="text-xl">🔒</span>
                  <div>
                    <div className="font-semibold text-sm text-primary">Password Protected</div>
                    <div className="text-xs text-tertiary mt-0.5">Click Change Password to update your credentials</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="tb-form-group mb-3.5">
                    <label className="tb-label">Current Password <span className="text-danger">*</span></label>
                    <input type="password" value={pwd.current} onChange={e=>setP("current",e.target.value)}
                      placeholder="Enter current password" className="tb-input"
                      style={pwdErrors.current?{borderColor:"var(--color-danger)"}:{}} />
                    {pwdErrors.current && <p className="text-xs text-danger mt-1">{pwdErrors.current}</p>}
                  </div>
                  <div className="tb-form-group mb-3.5">
                    <label className="tb-label">New Password <span className="text-danger">*</span></label>
                    <input type="password" value={pwd.new_} onChange={e=>setP("new_",e.target.value)}
                      placeholder="Minimum 8 characters" className="tb-input"
                      style={pwdErrors.new_?{borderColor:"var(--color-danger)"}:{}} />
                    {pwdErrors.new_ && <p className="text-xs text-danger mt-1">{pwdErrors.new_}</p>}
                    {pwd.new_ && pwd.new_.length>=8 && !pwdErrors.new_ && <p className="text-xs text-success mt-1">✓ Strong enough</p>}
                  </div>
                  <div className="tb-form-group mb-5">
                    <label className="tb-label">Confirm New Password <span className="text-danger">*</span></label>
                    <input type="password" value={pwd.confirm} onChange={e=>setP("confirm",e.target.value)}
                      placeholder="Repeat new password" className="tb-input"
                      style={pwdErrors.confirm?{borderColor:"var(--color-danger)"}:pwd.confirm&&pwd.confirm===pwd.new_?{borderColor:"var(--color-success)"}:{}} />
                    {pwdErrors.confirm && <p className="text-xs text-danger mt-1">{pwdErrors.confirm}</p>}
                    {pwd.confirm && pwd.confirm===pwd.new_ && !pwdErrors.confirm && <p className="text-xs text-success mt-1">✓ Passwords match</p>}
                  </div>
                  <div className="tb-action-bar">
                    <button onClick={()=>{setEditPwd(false);setPwd({current:"",new_:"",confirm:""});setPwdErrors({});}} className="tb-btn tb-btn-secondary flex-1 justify-center">Cancel</button>
                    <button onClick={handlePasswordChange} disabled={changePwdMut.isLoading} className="tb-btn tb-btn-primary flex-1 justify-center">
                      {changePwdMut.isLoading?"Saving...":"Update Password"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Session</div>
              <p className="text-sm text-tertiary mb-4">Sign out from all active sessions on this device.</p>
              <button onClick={handleLogout} className="tb-btn tb-btn-danger w-full justify-center">Sign Out</button>
            </div>

            <div className="tb-section">
              <div className="tb-section-title">Platform</div>
              {[["Version","2.0.0-sprint311"],["Platform","Triangle Black Enterprise MEP"],["Environment","Production"]].map(([l,v],i)=>(
                <div key={i} className="tb-detail-row">
                  <span className="tb-detail-key">{l}</span>
                  <span className="tb-detail-value">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
