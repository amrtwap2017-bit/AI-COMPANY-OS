from sqlalchemy.orm import Session
from hub.db.engine import engine
from hub.benchmarks.models import BenchmarkRun
from hub.integrations.aicos_bench import run_benchmark

def run_and_store(run_group: str, benchmark_id: str, agent_name: str | None = None, use_llm_scoring: bool | None = None) -> dict:
    raw = run_benchmark(benchmark_id=benchmark_id, agent_name=agent_name, use_llm_scoring=use_llm_scoring)

    if raw.get("ok") is False and "error" in raw:
        with Session(engine) as s:
            row = BenchmarkRun(
                run_group=run_group,
                benchmark_id=benchmark_id,
                agent_name=agent_name or "",
                ok=0,
                is_regression=0,
                aicos_run_id=None,
                raw=raw,
            )
            s.add(row)
            s.commit()
            return {"ok": False, "error": raw["error"], "stored_id": row.id, "raw": raw}

    is_reg = bool(raw.get("is_regression", False))
    ok = not is_reg

    aicos_run_id = raw.get("run_id")
    if isinstance(aicos_run_id, str):
        try:
            aicos_run_id = int(aicos_run_id)
        except Exception:
            aicos_run_id = None

    with Session(engine) as s:
        row = BenchmarkRun(
            run_group=run_group,
            benchmark_id=benchmark_id,
            agent_name=raw.get("agent_name") or (agent_name or ""),
            ok=1 if ok else 0,
            is_regression=1 if is_reg else 0,
            aicos_run_id=aicos_run_id,
            raw=raw,
        )
        s.add(row)
        s.commit()
        return {"ok": ok, "is_regression": is_reg, "stored_id": row.id, "aicos_run_id": aicos_run_id, "raw": raw}
