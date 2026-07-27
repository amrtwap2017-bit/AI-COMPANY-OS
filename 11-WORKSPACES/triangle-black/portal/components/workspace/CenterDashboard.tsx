// @ts-nocheck
import { KpiCard } from "./KpiCard";

type Kpi = {
  label: string;
  value: string;
  trend: string;
};

type QueueItem = {
  title: string;
  value: string;
  detail: string;
};

type InsightItem = {
  title: string;
  detail: string;
};

type ActivityItem = {
  time: string;
  title: string;
  detail: string;
};

type QuickAction = {
  label: string;
  detail: string;
};

type CenterDashboardProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  kpis: Kpi[];
  queues: QueueItem[];
  insights: InsightItem[];
  activity: ActivityItem[];
  quickActions: QuickAction[];
};

export function CenterDashboard(props: CenterDashboardProps) {
  const { eyebrow, title, subtitle, kpis, queues, insights, activity, quickActions } = props;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />
        <div className="p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            {eyebrow}
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            {subtitle}
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <KpiCard
            key={item.label}
            label={item.label}
            value={item.value}
            trend={item.trend}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Operational Queues</h2>
                <p className="mt-1 text-sm text-secondary">Actionable now</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {queues.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{item.value}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Activity Timeline</h2>
              <p className="mt-1 text-sm text-secondary">Latest cross-functional activity</p>
            </div>

            <div className="mt-5 space-y-4">
              {activity.map((item) => (
                <div key={item.time + item.title} className="flex gap-4">
                  <div className="mt-2 h-3 w-3 rounded-full bg-amber-500" />
                  <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="font-medium text-slate-900">{item.title}</div>
                      <div className="text-xs uppercase tracking-wide text-secondary">
                        {item.time}
                      </div>
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">AI and Business Insights</h2>
              <p className="mt-1 text-sm text-secondary">Decision support</p>
            </div>

            <div className="mt-4 space-y-3">
              {insights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Quick Actions</h2>
              <p className="mt-1 text-sm text-secondary">Workspace accelerators</p>
            </div>

            <div className="mt-4 space-y-3">
              {quickActions.map((item) => (
                <button
                  key={item.label}
                  className="block w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-200 hover:bg-white"
                >
                  <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
