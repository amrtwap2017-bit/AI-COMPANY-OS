import Link from "next/link";
import { hubGet } from "@/lib/hub";

type ToolCall = {
  id: number;
  ts: string;
  tool_name: string;
  ok: boolean;
  latency_ms: number;
  error: string;
};

type BuilderRun = {
  id: number;
  ts: string;
  ok: boolean;
  duration_ms: number;
  error: string;
  requirement?: string;
};

type AgentRun = {
  id: number;
  ts: string;
  actor_id: string;
  intent: string;
  ok: boolean;
  duration_ms: number;
  error: string;
};

type BenchmarkRun = {
  id: number;
  ts: string;
  benchmark_id: string;
  agent_name?: string;
  ok: boolean;
  is_regression: boolean;
};

type RunGroup = {
  run_group: string;
  builder_runs: BuilderRun[];
  agent_runs?: AgentRun[];
  benchmark_runs: BenchmarkRun[];
  tool_calls: ToolCall[];
};

export default async function RunDetail({
  params,
}: {
  params: { run_group: string };
}) {
  const rg = params.run_group;
  const data = await hubGet<RunGroup>(`/runs/${rg}`);

  return (
    <main style={{ fontFamily: "ui-sans-serif", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Run Group</h1>
          <div style={{ marginTop: 6 }}>
            <code style={{ background: "#f5f5f5", padding: "4px 6px", borderRadius: 8 }}>
              {data.run_group}
            </code>
          </div>
        </div>
        <Link href="/" style={{ textDecoration: "none" }}>
          ← Back
        </Link>
      </div>

      <Section title="Builder Runs">
        {data.builder_runs.length === 0 ? <div>(none)</div> : null}
        {data.builder_runs.map((r) => (
          <Card key={r.id}>
            <div style={{ fontWeight: 700 }}>
              #{r.id} — {r.ok ? "OK" : "FAILED"}
            </div>
            <div style={{ color: "#555", fontSize: 13 }}>
              {r.ts} • {r.duration_ms} ms
            </div>
            {r.requirement ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 13, color: "#777" }}>Requirement</div>
                <div>{r.requirement}</div>
              </div>
            ) : null}
            {!r.ok && r.error ? (
              <pre style={{ marginTop: 8, color: "#a00", whiteSpace: "pre-wrap" }}>
                {r.error}
              </pre>
            ) : null}
          </Card>
        ))}
      </Section>

      <Section title="Benchmarks">
        {data.benchmark_runs.length === 0 ? <div>(none)</div> : null}
        {data.benchmark_runs.map((b) => (
          <Card key={b.id}>
            <div style={{ fontWeight: 700 }}>
              {b.benchmark_id} — {b.ok ? "OK" : "FAILED"} {b.is_regression ? "(REGRESSION)" : ""}
            </div>
            <div style={{ color: "#555", fontSize: 13 }}>{b.ts}</div>
          </Card>
        ))}
      </Section>

      <Section title="Agent Runs">
        {!data.agent_runs || data.agent_runs.length === 0 ? <div>(none)</div> : null}
        {data.agent_runs?.map((a) => (
          <Card key={a.id}>
            <div style={{ fontWeight: 700 }}>
              #{a.id} — {a.intent} — {a.ok ? "OK" : "FAILED"}
            </div>
            <div style={{ color: "#555", fontSize: 13 }}>
              {a.ts} • {a.duration_ms} ms • actor: {a.actor_id}
            </div>
            {!a.ok && a.error ? (
              <pre style={{ marginTop: 8, color: "#a00", whiteSpace: "pre-wrap" }}>
                {a.error}
              </pre>
            ) : null}
          </Card>
        ))}
      </Section>

      <Section title="Tool Calls (Audit Trail)">
        {data.tool_calls.length === 0 ? <div>(none)</div> : null}
        {data.tool_calls.map((t) => (
          <Card key={t.id}>
            <div style={{ fontWeight: 700 }}>
              #{t.id} — {t.tool_name} — {t.ok ? "OK" : "FAILED"}
            </div>
            <div style={{ color: "#555", fontSize: 13 }}>
              {t.ts} • {t.latency_ms} ms
            </div>
            {!t.ok && t.error ? (
              <pre style={{ marginTop: 8, color: "#a00", whiteSpace: "pre-wrap" }}>
                {t.error}
              </pre>
            ) : null}
          </Card>
        ))}
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 18 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800 }}>{title}</h2>
      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>{children}</div>
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 12,
        background: "#fff",
      }}
    >
      {children}
    </div>
  );
}
