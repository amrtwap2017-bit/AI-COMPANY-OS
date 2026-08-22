"""
Triangle Black — Centralized Observability & Telemetry Platform (Sprint N-004)
Collects rolling metrics on latency, DB query budgets, cache ratios, and AI performance.
"""
import time
import threading
from typing import Dict, Any, List

class PlatformTelemetryStore:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(PlatformTelemetryStore, cls).__new__(cls)
                cls._instance._init_store()
            return cls._instance

    def _init_store(self):
        self.start_time = time.time()
        self.total_requests = 0
        self.error_4xx_count = 0
        self.error_5xx_count = 0
        self.latencies: List[float] = []
        self.db_queries_total = 0
        self.cache_hits = 0
        self.cache_misses = 0
        self.ai_requests = 0
        self.ai_latencies: List[float] = []

    def record_request(self, status_code: int, duration_ms: float, db_queries: int = 0):
        with self._lock:
            self.total_requests += 1
            if 400 <= status_code < 500:
                self.error_4xx_count += 1
            elif status_code >= 500:
                self.error_5xx_count += 1
            
            self.latencies.append(duration_ms)
            if len(self.latencies) > 1000:
                self.latencies.pop(0)
            
            self.db_queries_total += db_queries

    def record_cache(self, hit: bool):
        with self._lock:
            if hit:
                self.cache_hits += 1
            else:
                self.cache_misses += 1

    def record_ai_request(self, latency_ms: float):
        with self._lock:
            self.ai_requests += 1
            self.ai_latencies.append(latency_ms)
            if len(self.ai_latencies) > 500:
                self.ai_latencies.pop(0)

    def get_telemetry_report(self) -> Dict[str, Any]:
        with self._lock:
            uptime_sec = time.time() - self.start_time
            avg_latency = sum(self.latencies) / len(self.latencies) if self.latencies else 0.0
            sorted_lat = sorted(self.latencies)
            p95_latency = sorted_lat[int(len(sorted_lat) * 0.95)] if sorted_lat else 0.0
            
            total_cache = self.cache_hits + self.cache_misses
            cache_hit_rate = (self.cache_hits / total_cache * 100.0) if total_cache > 0 else 100.0
            avg_ai_latency = sum(self.ai_latencies) / len(self.ai_latencies) if self.ai_latencies else 0.0

            return {
                "uptime_seconds": round(uptime_sec, 1),
                "uptime_formatted": f"{int(uptime_sec // 3600)}h {int((uptime_sec % 3600) // 60)}m",
                "traffic": {
                    "total_requests": self.total_requests,
                    "error_4xx": self.error_4xx_count,
                    "error_5xx": self.error_5xx_count,
                    "error_rate_pct": round(((self.error_4xx_count + self.error_5xx_count) / max(1, self.total_requests)) * 100.0, 2)
                },
                "performance": {
                    "avg_latency_ms": round(avg_latency, 2),
                    "p95_latency_ms": round(p95_latency, 2),
                    "sla_budget_met": p95_latency < 300.0 or len(self.latencies) == 0,
                    "db_queries_recorded": self.db_queries_total
                },
                "cache": {
                    "hits": self.cache_hits,
                    "misses": self.cache_misses,
                    "hit_rate_pct": round(cache_hit_rate, 1)
                },
                "ai_telemetry": {
                    "requests_dispatched": self.ai_requests,
                    "avg_latency_ms": round(avg_ai_latency, 2)
                }
            }

telemetry_store = PlatformTelemetryStore()
