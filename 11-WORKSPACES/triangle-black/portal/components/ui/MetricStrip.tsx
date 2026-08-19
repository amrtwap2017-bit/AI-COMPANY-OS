// @ts-nocheck
import { MetricCard } from "./MetricCard";
import { ReactNode } from "react";
interface Metric { label: string; value: string|number; sub?: string; icon?: ReactNode; color?: string; trend?: "up"|"down"|"stable"; trendValue?: string; onClick?: ()=>void; }
interface Props { metrics: Metric[]; cols?: 2|3|4|5|6 }
export function MetricStrip({ metrics, cols = 4 }: Props) {
  const grid = { 2:"grid-cols-2", 3:"grid-cols-3", 4:"grid-cols-4", 5:"grid-cols-5", 6:"grid-cols-6" };
  return (
    <div className={`grid ${grid[cols]} gap-4`}>
      {(Array.isArray(metrics) ? metrics : []).map((m: any, i: number) => <MetricCard key={i} {...m} />)}
    </div>
  );
}
