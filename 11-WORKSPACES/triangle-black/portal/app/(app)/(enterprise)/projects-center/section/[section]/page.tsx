"use client";
// @ts-nocheck
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d: any): any[] => Array.isArray(d) ? d : d?.items || d?.data || d?.results || [];

export default function ProjectSection() {
  const params = useParams();
  const router = useRouter();
  const section = String(params?.section || "");

  const { data } = useQuery(["proj-section", section], () => authFetch("/api/v1/projects/").then(r => r.json()));
  const projects = toArr(data);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={() => router.push("/projects-center")} className="text-blue-600 hover:underline text-sm">← Projects</button>
        <h1 className="text-2xl font-bold capitalize">{section.replace(/-/g, " ")}</h1>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-lg border p-4">
        <div className="text-sm text-gray-500 mb-2">Projects in this section: {projects.length}</div>
        {projects.map((p: any, i: number) => (
          <div key={p.id || i} className="flex justify-between py-2 border-b text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800" onClick={() => router.push(`/projects-center/${p.id}`)}>
            <span className="font-medium">{p.name || p.title || p.id}</span>
            <span className="text-gray-400">{p.status || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
