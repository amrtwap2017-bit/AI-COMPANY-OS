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
