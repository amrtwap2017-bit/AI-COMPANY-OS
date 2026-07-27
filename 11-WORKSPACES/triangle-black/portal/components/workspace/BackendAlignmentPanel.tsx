// @ts-nocheck
import { countConnected, type BackendFeedStatus, type BackendTargetEndpoint } from "../../lib/entity-backend-matrix";

type BackendAlignmentPanelProps = {
  title: string;
  subtitle: string;
  currentFeeds: BackendFeedStatus[];
  targetEndpoints: BackendTargetEndpoint[];
  relatedObjects: string[];
};

export function BackendAlignmentPanel(props: BackendAlignmentPanelProps) {
  const { title, subtitle, currentFeeds, targetEndpoints, relatedObjects } = props;
  const connected = countConnected(currentFeeds);
  const total = currentFeeds.length;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            Backend Alignment
          </div>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
            Feed Readiness
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-950">
            {connected} / {total}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="text-sm font-semibold text-slate-950">Current Feed Status</div>
          {currentFeeds.map((feed, index) => (
            <div
              key={`${feed.label}-${index}`}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-900">{feed.label}</div>
                <span
                  className={[
                    "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide",
                    feed.ok
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700",
                  ].join(" ")}
                >
                  {feed.ok ? "Connected" : "Partial"}
                </span>
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-600">{feed.detail}</div>
            </div>
          ))}

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Related Objects</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {relatedObjects.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold text-slate-950">Target Endpoint Contract</div>
          {targetEndpoints.map((endpoint, index) => (
            <div
              key={`${endpoint.label}-${endpoint.route}-${index}`}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="text-sm font-semibold text-slate-900">{endpoint.label}</div>
              <div className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700">
                {endpoint.route}
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-600">{endpoint.purpose}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
