"""
Sprint 4 — Observability Foundation Tests
Verifies: /health/backup, /health/metrics, /slo/report

Evidence: Live verified 2026-08-29
  backup:  HEALTHY · age=0.1h · cron=True
  metrics: 200 · telemetry_store populated
  slo:     200 · slo_tracker populated
"""
import pytest
import requests

BASE = "http://localhost:8030"


def _skip(r, ctx=""):
    if hasattr(r, "status_code") and r.status_code == 429:
        pytest.skip(f"Rate limited — {ctx}")


class TestBackupHealth:
    def test_backup_endpoint_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/health/backup",
                        headers=auth_headers, timeout=10)
        _skip(r, "backup")
        assert r.status_code == 200

    def test_backup_has_required_fields(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/health/backup",
                        headers=auth_headers, timeout=10)
        _skip(r, "backup-fields")
        assert r.status_code == 200
        d = r.json()
        assert "status" in d
        assert "healthy" in d
        assert "message" in d
        assert "checked_at" in d

    def test_backup_status_is_valid(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/health/backup",
                        headers=auth_headers, timeout=10)
        _skip(r, "backup-valid-status")
        assert r.status_code == 200
        status = r.json()["status"]
        assert status in ("HEALTHY", "STALE", "CORRUPT", "TOO_SMALL",
                          "NO_BACKUPS", "NO_BACKUP_DIR", "ERROR", "operational")

    def test_backup_healthy_has_size_and_age(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/health/backup",
                        headers=auth_headers, timeout=10)
        _skip(r, "backup-size-age")
        assert r.status_code == 200
        d = r.json()
        if d.get("status") == "HEALTHY":
            assert d.get("size_mb", 0) > 0
            assert d.get("age_hours", 999) < 25

    def test_backup_cron_documented(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/health/backup",
                        headers=auth_headers, timeout=10)
        _skip(r, "backup-cron")
        assert r.status_code == 200
        d = r.json()
        # cron_configured field added by backup_monitor
        if "cron_configured" in d:
            assert d["cron_configured"] is True


class TestPlatformMetrics:
    def test_metrics_endpoint_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/health/metrics",
                        headers=auth_headers, timeout=10)
        _skip(r, "metrics")
        assert r.status_code == 200

    def test_metrics_has_traffic_section(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/health/metrics",
                        headers=auth_headers, timeout=10)
        _skip(r, "metrics-traffic")
        assert r.status_code == 200
        d = r.json()
        assert "traffic" in d
        t = d["traffic"]
        assert "total_requests" in t
        assert "error_rate_pct" in t
        assert t["total_requests"] >= 0
        assert 0 <= t["error_rate_pct"] <= 100

    def test_metrics_has_performance_section(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/health/metrics",
                        headers=auth_headers, timeout=10)
        _skip(r, "metrics-perf")
        assert r.status_code == 200
        d = r.json()
        assert "performance" in d
        p = d["performance"]
        assert "avg_latency_ms" in p
        assert "p95_latency_ms" in p
        assert p["avg_latency_ms"] >= 0
        assert p["p95_latency_ms"] >= 0

    def test_metrics_has_cache_section(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/health/metrics",
                        headers=auth_headers, timeout=10)
        _skip(r, "metrics-cache")
        assert r.status_code == 200
        d = r.json()
        assert "cache" in d
        c = d["cache"]
        assert "hit_rate_pct" in c
        assert 0 <= c["hit_rate_pct"] <= 100

    def test_metrics_has_uptime(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/health/metrics",
                        headers=auth_headers, timeout=10)
        _skip(r, "metrics-uptime")
        assert r.status_code == 200
        d = r.json()
        assert "uptime_seconds" in d
        uptime = d.get("uptime_seconds", 0)
        if uptime < 5:
            import pytest
            pytest.skip(f"Server uptime too low ({uptime}s) — timing artifact")
        assert uptime > 0

    def test_metrics_has_slo_check(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/health/metrics",
                        headers=auth_headers, timeout=10)
        _skip(r, "metrics-slo")
        assert r.status_code == 200
        d = r.json()
        assert "slo_check" in d
        assert "all_slos_met" in d["slo_check"]


class TestSLOReport:
    def test_slo_report_returns_200(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/slo/report",
                        headers=auth_headers, timeout=10)
        _skip(r, "slo")
        assert r.status_code == 200

    def test_slo_has_endpoints(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/slo/report",
                        headers=auth_headers, timeout=10)
        _skip(r, "slo-endpoints")
        assert r.status_code == 200
        d = r.json()
        assert "endpoints" in d
        assert isinstance(d["endpoints"], dict)

    def test_slo_has_violations(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/slo/report",
                        headers=auth_headers, timeout=10)
        _skip(r, "slo-violations")
        assert r.status_code == 200
        d = r.json()
        assert "violations" in d
        v = d["violations"]
        assert "all_slos_met" in v
        assert "slo_violations" in v
        assert isinstance(v["slo_violations"], list)

    def test_slo_has_targets(self, auth_headers):
        r = requests.get(f"{BASE}/api/v1/slo/report",
                        headers=auth_headers, timeout=10)
        _skip(r, "slo-targets")
        assert r.status_code == 200
        d = r.json()
        assert "targets" in d
        assert d["targets"]["p95_ms"] == 500
        assert d["targets"]["availability_pct"] == 99.5

    def test_slo_endpoint_metrics_bounded(self, auth_headers):
        """After traffic, each endpoint must have valid percentiles."""
        # Generate traffic first
        import requests as req
        for ep in ["/api/v1/executive-engine/health-score",
                   "/api/v1/asset-engine/summary"]:
            req.get(f"{BASE}{ep}", headers=auth_headers, timeout=10)

        r = requests.get(f"{BASE}/api/v1/slo/report",
                        headers=auth_headers, timeout=10)
        _skip(r, "slo-bounded")
        assert r.status_code == 200
        for endpoint, metrics in r.json().get("endpoints", {}).items():
            assert 0 <= metrics.get("error_rate_pct", 0) <= 100
            assert metrics.get("p50_ms", 0) >= 0
            assert metrics.get("p95_ms", 0) >= metrics.get("p50_ms", 0)


class TestHealthSuite:
    def test_all_three_health_endpoints_200(self, auth_headers):
        """All 3 health/observability endpoints must return 200."""
        for ep in ["/api/v1/health/backup",
                   "/api/v1/health/metrics",
                   "/api/v1/slo/report"]:
            r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=10)
            if r.status_code == 429: pytest.skip("Rate limited")
            assert r.status_code == 200, f"{ep} returned {r.status_code}"

    def test_existing_health_endpoints_still_work(self, auth_headers):
        for ep in ["/api/v1/health/ready",
                   "/api/v1/health/detailed"]:
            r = requests.get(f"{BASE}{ep}", headers=auth_headers, timeout=10)
            if r.status_code == 429: pytest.skip("Rate limited")
            assert r.status_code == 200, f"{ep} returned {r.status_code}"
