"use client";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";

const toArr = (d: any) => Array.isArray(d) ? d : d?.items || d?.data || [];

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: ok ? "#22c55e" : "#ef4444",
      boxShadow: ok ? "0 0 6px #22c55e" : "0 0 6px #ef4444",
    }} />
  );
}

function MetricCard({ title, value, unit, status, detail }: {
  title: string; value: any; unit?: string; status?: "ok"|"warn"|"error"; detail?: string;
}) {
  const colors = { ok: "#22c55e", warn: "#f59e0b", error: "#ef4444" };
  const color = status ? colors[status] : "rgba(255,255,255,0.7)";
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: "16px 20px",
    }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
                    letterSpacing: "0.08em", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>
        {value ?? "—"}{unit && <span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4,
                                              color: "rgba(255,255,255,0.4)" }}>{unit}</span>}
      </div>
      {detail && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
        {detail}
      </div>}
    </div>
  );
}

export default function PlatformHealthPage() {
  const { data: live, isLoading: liveLoading } = useQuery(
    ["health-live"], () => authFetch("/api/v1/health/live"), { refetchInterval: 30000 }
  );
  const { data: ready, isLoading: readyLoading } = useQuery(
    ["health-ready"], () => authFetch("/api/v1/health/ready"), { refetchInterval: 30000 }
  );
  const { data: metrics, isLoading: metricsLoading } = useQuery(
    ["health-metrics"], () => authFetch("/api/v1/health/metrics"), { refetchInterval: 60000 }
  );
  const { data: attention } = useQuery(
    ["health-attention"], () => authFetch("/api/v1/attention/"), { refetchInterval: 60000 }
  );
  const { data: recsData } = useQuery(
    ["health-recs"], () => authFetch("/api/v1/recommendations/summary"), { refetchInterval: 60000 }
  );

  const isLive = live?.status === "live";
  const isReady = ready?.status === "ready" || ready?.db === "ok";
  const dbOk = ready?.db === "ok" || ready?.database === "ok";
  const dbQueries = metrics?.db_query_count ?? metrics?.queries ?? "—";
  const uptime = metrics?.uptime_seconds ?? metrics?.uptime ?? null;
  const latency = metrics?.avg_latency_ms ?? metrics?.latency ?? "—";
  const uptimeStr = uptime ? `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600)/60)}m` : "—";

  // Business metrics
  const attentionScore = attention?.attention_score ?? "—";
  const urgency = attention?.urgency ?? "—";
  const criticalWOs = attention?.critical_wos ?? attention?.critical ?? "—";
  const overduePM = attention?.overdue_pm ?? "—";
  const pendingRecs = recsData?.pending ?? attention?.pending_ai ?? "—";

  const overallOk = isLive && isReady && dbOk;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
                      letterSpacing: "0.1em", marginBottom: 6 }}>
          Administration → Platform
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.9)", margin: 0 }}>
            Platform Health
          </h1>
          <span style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 20,
            background: overallOk ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${overallOk ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            fontSize: 12, fontWeight: 600,
            color: overallOk ? "#86efac" : "#fca5a5",
          }}>
            <StatusDot ok={overallOk} />
            {overallOk ? "OPERATIONAL" : "DEGRADED"}
          </span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 6 }}>
          Real-time system status and business intelligence metrics. Refreshes every 30s.
        </p>
      </div>

      {/* System Status Row */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)",
                      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          System Services
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <MetricCard title="API Status" value={isLive ? "LIVE" : "DOWN"}
            status={isLive ? "ok" : "error"} detail="Health check endpoint" />
          <MetricCard title="Database" value={dbOk ? "CONNECTED" : "ERROR"}
            status={dbOk ? "ok" : "error"} detail="PostgreSQL connection" />
          <MetricCard title="Uptime" value={uptimeStr} status="ok" detail="Since last restart" />
          <MetricCard title="DB Queries" value={dbQueries} unit="queries"
            status="ok" detail="This session" />
        </div>
      </div>

      {/* Business Intelligence Row */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)",
                      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          Operations Intelligence
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <MetricCard title="Attention Score" value={attentionScore} unit="/100"
            status={Number(attentionScore) > 80 ? "error" : Number(attentionScore) > 50 ? "warn" : "ok"}
            detail={`Urgency: ${urgency}`} />
          <MetricCard title="Critical WOs" value={criticalWOs}
            status={Number(criticalWOs) > 100 ? "error" : Number(criticalWOs) > 50 ? "warn" : "ok"}
            detail="Open critical work orders" />
          <MetricCard title="Overdue PM" value={overduePM}
            status={Number(overduePM) > 200 ? "error" : Number(overduePM) > 100 ? "warn" : "ok"}
            detail="Maintenance plans past due" />
          <MetricCard title="Pending AI" value={pendingRecs}
            status={Number(pendingRecs) > 500 ? "warn" : "ok"}
            detail="Recommendations awaiting review" />
        </div>
      </div>

      {/* Raw metrics */}
      {metrics && (
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12, padding: 20,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)",
                        textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Raw Metrics
          </div>
          <pre style={{
            fontSize: 11, color: "rgba(255,255,255,0.5)",
            fontFamily: "monospace", margin: 0, whiteSpace: "pre-wrap",
            maxHeight: 300, overflow: "auto",
          }}>
            {JSON.stringify(metrics, null, 2)}
          </pre>
        </div>
      )}

      {/* Loading state */}
      {(liveLoading || readyLoading || metricsLoading) && (
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center",
                      padding: "20px 0" }}>
          Loading platform metrics...
        </div>
      )}

      <div style={{ marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.25)",
                    textAlign: "right" }}>
        Last updated: {new Date().toLocaleTimeString()} · Auto-refreshes every 30 seconds
      </div>
    </div>
  );
}
