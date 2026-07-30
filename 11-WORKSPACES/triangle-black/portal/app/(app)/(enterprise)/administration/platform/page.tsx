"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { useRouter } from "next/navigation";

const toArr = (d) => Array.isArray(d) ? d : d?.items || d?.data || [];
const HERO = {background:"linear-gradient(140deg, #2A231E 0%, #332C27 40%, #3D352F 100%)",borderBottom:"1px solid rgba(185,146,76,0.12)",padding:"32px"};

export default function PlatformAdminPage() {
  const router = useRouter();
  const { data: health } = useQuery(["plat-health"], () => authFetch("/api/v1/health").then(r=>r.json()), {staleTime:30000});
  const { data: twin } = useQuery(["plat-twin"], () => authFetch("/api/v1/twin/state").then(r=>r.json()), {staleTime:30000});
  const { data: audit } = useQuery(["plat-audit"], () => authFetch("/api/v1/security/audit").then(r=>r.json()), {staleTime:60000});
  const { data: users } = useQuery(["plat-users"], () => authFetch("/api/v1/users/").then(r=>r.json()), {staleTime:60000});
  const twinScore = twin?.health_score||0;
  const userList = toArr(users);
  const scoreColor = twinScore>=90?"#547C4D":twinScore>=70?"#B07A2A":"#A84A3D";

  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      <div style={HERO}>
        <div style={{maxWidth:1400,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24}}>
            <div>
              <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Administration</div>
              <h1 style={{fontSize:"1.75rem",fontWeight:800,color:"#F3EFE8",letterSpacing:"-0.02em",margin:0}}>Platform Management</h1>
              <p style={{color:"rgba(210,195,175,0.60)",fontSize:"0.8125rem",marginTop:6}}>System health, security, and configuration</p>
            </div>
            <div style={{background:`${scoreColor}20`,border:`1px solid ${scoreColor}40`,borderRadius:14,padding:"16px 24px",textAlign:"center",flexShrink:0}}>
              <div style={{fontSize:"2.5rem",fontWeight:900,color:scoreColor,lineHeight:1}}>{twinScore}</div>
              <div style={{fontSize:"0.5625rem",color:"rgba(185,165,140,0.55)",textTransform:"uppercase",letterSpacing:"0.07em",marginTop:4}}>Platform Twin Score</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:20}}>
            {[
              {label:"DB Status",value:health?.database==="connected"?"Connected":"Offline",color:health?.database==="connected"?"#547C4D":"#A84A3D"},
              {label:"Active Users",value:audit?.active_users||userList.length,color:"#F3EFE8"},
              {label:"Admin Count",value:audit?.admin_count||0,color:audit?.admin_count>3?"#B07A2A":"#F3EFE8"},
              {label:"JWT Secure",value:audit?.jwt_secret_is_default===false?"✓ Secure":"⚠ Default",color:audit?.jwt_secret_is_default===false?"#547C4D":"#A84A3D"},
            ].map((k,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(185,146,76,0.12)",borderRadius:10,padding:"12px"}}>
                <div style={{fontSize:"1.125rem",fontWeight:800,color:k.color}}>{k.value}</div>
                <div style={{fontSize:"0.5625rem",color:"rgba(185,165,140,0.55)",textTransform:"uppercase",letterSpacing:"0.05em",marginTop:4}}>{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
        {[
          {title:"User Management",icon:"👥",desc:"Manage users and roles",path:"/settings/users",stat:`${userList.length} users`},
          {title:"Audit Trail",icon:"📜",desc:"View all platform activity",path:"/administration/audit",stat:"Full history"},
          {title:"Security Audit",icon:"🔒",desc:"JWT, RBAC, and access control",path:"/settings/users",stat:audit?.jwt_secret_is_default===false?"Secured":"Needs attention"},
          {title:"Hotels & Sites",icon:"🏨",desc:"Configure hotel sites",path:"/administration/hotels",stat:"5 sites"},
          {title:"Data Export",icon:"📤",desc:"Export platform data as CSV",path:"/reports",stat:"8 export types"},
          {title:"Analytics Hub",icon:"📊",desc:"Platform analytics",path:"/analytics",stat:"Live data"},
        ].map((item,i)=>(
          <button key={i} onClick={()=>router.push(item.path)}
            style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24,textAlign:"left",cursor:"pointer",transition:"all 160ms ease",display:"flex",flexDirection:"column",gap:8}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(185,146,76,0.3)";e.currentTarget.style.transform="translateY(-1px)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--color-border)";e.currentTarget.style.transform="none";}}>
            <span style={{fontSize:"1.75rem"}}>{item.icon}</span>
            <div style={{fontSize:"0.9375rem",fontWeight:700,color:"var(--color-text-1)"}}>{item.title}</div>
            <div style={{fontSize:"0.8125rem",color:"var(--color-text-3)"}}>{item.desc}</div>
            <div style={{fontSize:"0.75rem",fontWeight:600,color:"#B9924C",marginTop:4}}>{item.stat}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
