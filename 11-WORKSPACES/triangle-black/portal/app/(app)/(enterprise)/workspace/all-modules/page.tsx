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
    return navGroups.map((group: any) => {
      const centers = group.items
        .map((key: any) => enterpriseCenters.find((c: any) => c.key === key))
        .filter(Boolean)
        .map(center => {
          const children = (center.children || []).filter((child: any) =>
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
    }).filter((g: any) => g.centers.length > 0);
  }, [query]);

  return (
    <div className="min-h-screen bg-base">
      <div className="tb-hero">
        <div className="tb-hero-inner">
          <div className="text-label-upper text-brand mb-1.5">Workspace</div>
          <h1 className="tb-hero-title">All Modules</h1>
          <p className="tb-hero-description">Complete platform sitemap — every module remains accessible</p>
          <div className="mt-5" style={{maxWidth:520}}>
            <input
              value={query}
              onChange={(e: any) =>setQuery(e.target.value)}
              placeholder="Search modules, pages, workflows..."
              className="tb-input w-full"
            />
          </div>
        </div>
      </div>

      <div className="tb-canvas">
        <div className="flex flex-col gap-6">
          {groups.map((group: any, gi: any) => (
            <div key={group.label} className="tb-section">
              <div className="text-label-upper text-brand mb-3">{group.label}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
                {group.centers.map((center, i) => (
                  <div key={center.key} className="rounded-xl p-4 bg-surface-alt border border-default">
                    <button
                      onClick={()=>router.push(center.href)}
                      className="flex items-center justify-between w-full bg-transparent border-0 cursor-pointer text-left p-0"
                    >
                      <div>
                        <div className="text-sm font-bold text-primary">{center.label}</div>
                        <div className="text-xs text-tertiary mt-0.5">{center.badge || center.shortLabel || "Module"}</div>
                      </div>
                      <span className="text-brand text-sm">→</span>
                    </button>
                    {center.children?.length > 0 && (
                      <div className="flex flex-col gap-1.5 mt-3.5 pt-3 border-t border-divider">
                        {center.children.map((child: any, ci: any) => (
                          <button
                            key={`${child.href}-${ci}`}
                            onClick={()=>router.push(child.href)}
                            className="flex items-center justify-between w-full bg-transparent border-0 cursor-pointer text-left py-1"
                          >
                            <div>
                              <div className="text-xs font-semibold text-secondary">{child.label}</div>
                              {child.description && <div className="text-xs text-tertiary">{child.description}</div>}
                            </div>
                            <span className="text-brand text-xs">↗</span>
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
    </div>
  );
}
