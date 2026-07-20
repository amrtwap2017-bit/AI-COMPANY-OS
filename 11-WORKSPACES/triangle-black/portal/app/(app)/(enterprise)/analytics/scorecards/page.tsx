"use client";
// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { PageHeader, PageWrapper, LoadingState, Progress, SectionCard } from "@/components/ui";
import { analyticsApi } from "@/lib/api/enterprise";
import { RefreshCw, Target } from "lucide-react";
import { toast } from "@/lib/toast";

export default function ScorecardsPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["analytics-scorecards"],
    queryFn:  () => analyticsApi.scorecards(),
    refetchInterval: 60_000,
  });

  const scorecards = data?.data?.scorecards || [];

  return (
    <PageWrapper>
      <PageHeader title="Enterprise Scorecards" subtitle="Cross-center health and performance metrics" badge="KPI"
        actions={<button onClick={() => { refetch(); toast.success("Refreshed"); }} disabled={isFetching} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl"><RefreshCw className={"w-4 h-4 " + (isFetching ? "animate-spin" : "")} /></button>} />

      {isLoading ? <LoadingState type="cards" rows={4} cols={2} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scorecards.length === 0 ? (
            <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Target className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500">No scorecard data yet</p>
              <p className="text-xs text-slate-400 mt-1">Scorecards are generated from live operational data</p>
            </div>
          ) : scorecards.map((sc:any) => {
            const isGood = sc.score >= sc.target;
            return (
              <div key={sc.domain} className={"bg-white rounded-2xl border p-5 " + (isGood ? "border-emerald-200" : "border-amber-200")}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-slate-900">{sc.domain}</p>
                  <span className={"text-lg font-bold " + (isGood ? "text-emerald-600" : "text-amber-600")}>{sc.score}%</span>
                </div>
                <Progress value={sc.score} max={100} size="md"
                  color={isGood ? "emerald" : "amber"}
                  showValue={false} />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-slate-400">{sc.label}</p>
                  <p className="text-xs text-slate-400">Target: {sc.target}%</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
