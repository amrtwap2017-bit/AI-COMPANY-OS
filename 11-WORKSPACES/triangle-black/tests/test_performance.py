"""
Tests: Performance benchmarks
Generated: 2026-07-27
"""
import requests
import time
import pytest

BASE_URL = "http://localhost:8030"
MAX_RESPONSE_MS = 1000  # 1 second max


@pytest.mark.skip(reason="Performance tests require stable environment - enable manually")
class TestPerformance:
    def _measure(self, method, url, headers=None, data=None, n=3):
        times = []
        for _ in range(n):
            start = time.monotonic()
            if method == "GET":
                r = requests.get(url, headers=headers, timeout=10)
            else:
                r = requests.post(url, data=data, timeout=10)
            times.append((time.monotonic() - start) * 1000)
        return sum(times) / len(times), r.status_code

    def test_login_performance(self):
        avg, status = self._measure("POST", f"{BASE_URL}/api/v1/auth/login",
            data={"username":"amr@triangleblack.com","password":"admin123"})
        assert status == 200
        assert avg < MAX_RESPONSE_MS, f"Login too slow: {avg:.0f}ms"

    def test_work_orders_performance(self, auth_headers):
        avg, status = self._measure("GET", f"{BASE_URL}/api/v1/work-orders/?limit=50",
            headers=auth_headers)
        assert status == 200
        assert avg < MAX_RESPONSE_MS, f"Work orders too slow: {avg:.0f}ms"

    def test_twin_performance(self, auth_headers):
        avg, status = self._measure("GET", f"{BASE_URL}/api/v1/twin/state",
            headers=auth_headers)
        assert status == 200
        assert avg < MAX_RESPONSE_MS, f"Twin state too slow: {avg:.0f}ms"

    def test_leads_performance(self, auth_headers):
        avg, status = self._measure("GET", f"{BASE_URL}/api/v1/leads/?limit=50",
            headers=auth_headers)
        assert status == 200
        assert avg < MAX_RESPONSE_MS, f"Leads too slow: {avg:.0f}ms"

    def test_notifications_performance(self, auth_headers):
        avg, status = self._measure("GET", f"{BASE_URL}/api/v1/notifications/?limit=50",
            headers=auth_headers)
        assert status == 200
        assert avg < MAX_RESPONSE_MS, f"Notifications too slow: {avg:.0f}ms"
