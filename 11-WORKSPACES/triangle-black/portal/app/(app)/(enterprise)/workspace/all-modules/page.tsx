"use client";
// @ts-nocheck
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { enterpriseCenters, navGroups } from "@/components/workspace/nav";

export default function AllModulesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return navGroups.map(group => {
      const centers = group.items
        .map(key => enterpriseCenters.find(c => c.key === key))
        .filter(Boolean)
        .map(center => {
          const children = (center.children || []).filter(child =>
            !q ||
            center.label.toLowerCase().includes(q) ||
            child.label.toLowerCase().includes(q) ||
            (child.description || "").toLowerCase().includes(q)
          );
          const centerMatches = !q || center.label.toLowerCase().includes(q);
          return centerMatches || children.length > 0 ? { ...center, children } : null;
        })
        .filter(Boolean);
      return { ...group, centers };
    }).filter(g => g.centers.length > 0);
  }, [query]);

  return (
    <div style={{minHeight:"100vh",background:"var(--color-bg)"}}>
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:6}}>Workspace</div>
          <h1 className="tb-hero-title">All Modules</h1>
          <p className="tb-hero-description">Complete platform sitemap — every module remains accessible</p>
          <div style={{marginTop:20,maxWidth:520}}>
            <input
              value={query}
              onChange={e=>setQuery(e.target.value)}
              placeholder="Search modules, pages, workflows..."
              style={{width:"100%",background:"rgba(255,255,255,0.55)",border:"1px solid rgba(185,146,76,0.18)",borderRadius:10,padding:"12px 14px",fontSize:"0.875rem",color:"#221D1A",outline:"none"}}
            />
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:"0 auto",padding:"32px",display:"flex",flexDirection:"column",gap:24}}>
        {groups.map((group, gi) => (
          <div key={group.label} style={{background:"var(--color-surface)",border:"1px solid var(--color-border)",borderRadius:14,padding:24}}>
            <div style={{fontSize:"0.6875rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#B9924C",marginBottom:12}}>{group.label}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
              {group.centers.map((center, i) => (
                <div key={center.key} style={{background:"var(--color-bg-alt)",border:"1px solid var(--color-border)",borderRadius:12,padding:16}}>
                  <button
                    onClick={()=>router.push(center.href)}
                    style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"transparent",border:"none",cursor:"pointer",textAlign:"left",padding:0}}
                  >
                    <div>
                      <div style={{fontSize:"0.9375rem",fontWeight:700,color:"var(--color-text-1)"}}>{center.label}</div>
                      <div style={{fontSize:"0.75rem",color:"var(--color-text-3)",marginTop:2}}>{center.badge || center.shortLabel || "Module"}</div>
                    </div>
                    <span style={{color:"#B9924C",fontSize:"0.875rem"}}>→</span>
                  </button>
                  {center.children?.length > 0 && (
                    <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:14,paddingTop:12,borderTop:"1px solid var(--color-divider)"}}>
                      {center.children.map((child, ci) => (
                        <button
                          key={`${child.href}-${ci}`}
                          onClick={()=>router.push(child.href)}
                          style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:"transparent",border:"none",cursor:"pointer",textAlign:"left",padding:"4px 0"}}
                        >
                          <div>
                            <div style={{fontSize:"0.8125rem",fontWeight:600,color:"var(--color-text-2)"}}>{child.label}</div>
                            {child.description && <div style={{fontSize:"0.6875rem",color:"var(--color-text-3)"}}>{child.description}</div>}
                          </div>
                          <span style={{color:"#B9924C",fontSize:"0.75rem"}}>↗</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
