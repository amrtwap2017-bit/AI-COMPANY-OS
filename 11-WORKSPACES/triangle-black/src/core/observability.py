"""
Triangle Black — A-006 OpenTelemetry Observability
Provides distributed tracing, metrics, and SLO measurement.
"""
import os
import time
import logging
from typing import Optional
from contextlib import contextmanager

logger = logging.getLogger("triangle_black.observability")

# ── OpenTelemetry Setup ────────────────────────────────────────────────────
_tracer = None
_meter = None
_otel_enabled = False

def init_observability(app=None, service_name: str = "triangle-black"):
    """Initialize OpenTelemetry — safe, never raises."""
    global _tracer, _meter, _otel_enabled

    if not os.environ.get("OTEL_ENABLED", "").lower() in ("1", "true", "yes"):
        logger.info("OpenTelemetry disabled (set OTEL_ENABLED=1 to enable)")
        return

    try:
        from opentelemetry import trace, metrics
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
        from opentelemetry.sdk.metrics import MeterProvider
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.semconv.resource import ResourceAttributes

        resource = Resource.create({
            ResourceAttributes.SERVICE_NAME: service_name,
            ResourceAttributes.SERVICE_VERSION: "6.0.0",
            ResourceAttributes.DEPLOYMENT_ENVIRONMENT: os.environ.get("ENVIRONMENT", "development"),
        })

        # Tracer
        provider = TracerProvider(resource=resource)
        otel_endpoint = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT")
        if otel_endpoint:
            from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
            provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint=otel_endpoint)))
        trace.set_tracer_provider(provider)
        _tracer = trace.get_tracer(service_name)

        # FastAPI instrumentation
        if app:
            from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
            FastAPIInstrumentor.instrument_app(app)

        # SQLAlchemy instrumentation
        try:
            from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
            SQLAlchemyInstrumentor().instrument()
        except Exception:
            pass

        _otel_enabled = True
        logger.info(f"✅ OpenTelemetry initialized — service: {service_name}")

    except Exception as e:
        logger.warning(f"OpenTelemetry init failed (non-fatal): {e}")


@contextmanager
def trace_operation(name: str, attributes: dict = None):
    """Context manager for operation tracing — safe, never raises."""
    if not _otel_enabled or _tracer is None:
        yield None
        return
    try:
        with _tracer.start_as_current_span(name) as span:
            if attributes:
                for k, v in attributes.items():
                    span.set_attribute(k, str(v))
            yield span
    except Exception:
        yield None


# ── SLO Measurement ────────────────────────────────────────────────────────
class SLOTracker:
    """
    In-memory SLO measurement — tracks key platform SLIs.
    In production, ship these to Prometheus/Grafana.
    """
    def __init__(self):
        self._requests: dict = {}  # endpoint → [latencies]
        self._errors: dict = {}    # endpoint → error_count
        self._total: dict = {}     # endpoint → total_count

    def record(self, endpoint: str, latency_ms: float, success: bool):
        if endpoint not in self._requests:
            self._requests[endpoint] = []
            self._errors[endpoint] = 0
            self._total[endpoint] = 0
        self._requests[endpoint].append(latency_ms)
        self._total[endpoint] += 1
        if not success:
            self._errors[endpoint] += 1
        # Keep only last 1000 measurements per endpoint
        if len(self._requests[endpoint]) > 1000:
            self._requests[endpoint] = self._requests[endpoint][-1000:]

    def get_slo_report(self) -> dict:
        report = {}
        for endpoint, latencies in self._requests.items():
            if not latencies:
                continue
            sorted_lat = sorted(latencies)
            total = self._total.get(endpoint, 1)
            errors = self._errors.get(endpoint, 0)
            p95_idx = int(len(sorted_lat) * 0.95)
            p99_idx = int(len(sorted_lat) * 0.99)
            report[endpoint] = {
                "total_requests": total,
                "error_rate_pct": round(errors / max(total, 1) * 100, 2),
                "availability_pct": round((total - errors) / max(total, 1) * 100, 2),
                "p50_ms": round(sorted_lat[len(sorted_lat)//2], 1),
                "p95_ms": round(sorted_lat[min(p95_idx, len(sorted_lat)-1)], 1),
                "p99_ms": round(sorted_lat[min(p99_idx, len(sorted_lat)-1)], 1),
                "avg_ms": round(sum(latencies) / len(latencies), 1),
            }
        return report

    def check_slos(self) -> dict:
        """Check SLOs against defined targets."""
        SLO_TARGETS = {
            "availability_pct": 99.5,
            "p95_ms_read": 500,
            "p95_ms_write": 1000,
        }
        report = self.get_slo_report()
        violations = []
        for endpoint, metrics in report.items():
            if metrics["availability_pct"] < SLO_TARGETS["availability_pct"]:
                violations.append({
                    "endpoint": endpoint,
                    "slo": "availability",
                    "target": SLO_TARGETS["availability_pct"],
                    "actual": metrics["availability_pct"]
                })
            if metrics["p95_ms"] > SLO_TARGETS["p95_ms_read"]:
                violations.append({
                    "endpoint": endpoint,
                    "slo": "p95_latency",
                    "target": SLO_TARGETS["p95_ms_read"],
                    "actual": metrics["p95_ms"]
                })
        return {
            "slo_violations": violations,
            "all_slos_met": len(violations) == 0,
            "checked_endpoints": len(report),
        }


# Global SLO tracker
slo_tracker = SLOTracker()


# ── Middleware ─────────────────────────────────────────────────────────────
async def observability_middleware(request, call_next):
    """FastAPI middleware — records latency and SLO metrics."""
    start = time.perf_counter()
    endpoint = f"{request.method} {request.url.path}"
    response = None
    success = True
    try:
        response = await call_next(request)
        success = response.status_code < 500
        return response
    except Exception as e:
        success = False
        raise
    finally:
        latency_ms = (time.perf_counter() - start) * 1000
        slo_tracker.record(endpoint, latency_ms, success)


def get_observability_summary() -> dict:
    """Returns current observability state."""
    return {
        "otel_enabled": _otel_enabled,
        "slo_report": slo_tracker.get_slo_report(),
        "slo_check": slo_tracker.check_slos(),
    }


# ─── TelemetryStore — added for N-004 test compatibility ───────────────────
import threading as _threading
from collections import deque as _deque

class _TelemetryStore:
    """In-memory telemetry accumulator. Thread-safe. Singleton via module."""

    def __init__(self):
        self._lock = _threading.Lock()
        self._start_time = time.time()
        self._requests: list = []
        self._cache_hits = 0
        self._cache_misses = 0
        self._ai_requests: list = []

    def record_request(self, status_code: int, latency_ms: float, db_queries: int = 0):
        with self._lock:
            self._requests.append({
                "status": status_code,
                "latency_ms": latency_ms,
                "db_queries": db_queries,
                "ts": time.time(),
            })
            # Keep last 10000 only
            if len(self._requests) > 10000:
                self._requests = self._requests[-5000:]

    def record_cache(self, hit: bool):
        with self._lock:
            if hit:
                self._cache_hits += 1
            else:
                self._cache_misses += 1

    def record_ai_request(self, latency_ms: float):
        with self._lock:
            self._ai_requests.append({"latency_ms": latency_ms, "ts": time.time()})
            if len(self._ai_requests) > 1000:
                self._ai_requests = self._ai_requests[-500:]

    def get_telemetry_report(self) -> dict:
        with self._lock:
            reqs = list(self._requests)
            ai_reqs = list(self._ai_requests)
            cache_hits = self._cache_hits
            cache_misses = self._cache_misses
            uptime = time.time() - self._start_time

        total = len(reqs)
        errors = sum(1 for r in reqs if r["status"] >= 500)
        latencies = [r["latency_ms"] for r in reqs]
        avg_latency = sum(latencies) / max(len(latencies), 1)
        p95 = sorted(latencies)[int(len(latencies) * 0.95)] if latencies else 0

        total_cache = cache_hits + cache_misses
        cache_hit_rate = round(cache_hits / max(total_cache, 1) * 100, 1)

        ai_latencies = [r["latency_ms"] for r in ai_reqs]
        avg_ai_latency = sum(ai_latencies) / max(len(ai_latencies), 1)

        return {
            "status": "operational",
            "uptime_seconds": round(uptime, 1),
            "traffic": {
                "total_requests": total,
                "error_count": errors,
                "error_rate_pct": round(errors / max(total, 1) * 100, 2),
            },
            "performance": {
                "avg_latency_ms": round(avg_latency, 2),
                "p95_latency_ms": round(p95, 2),
                "avg_db_queries": round(
                    sum(r["db_queries"] for r in reqs) / max(total, 1), 2
                ),
            },
            "cache": {
                "hits": cache_hits,
                "misses": cache_misses,
                "hit_rate_pct": cache_hit_rate,
            },
            "ai_telemetry": {
                "total_requests": len(ai_reqs),
                "avg_latency_ms": round(avg_ai_latency, 2),
            },
        }


# Module-level singleton
telemetry_store = _TelemetryStore()
