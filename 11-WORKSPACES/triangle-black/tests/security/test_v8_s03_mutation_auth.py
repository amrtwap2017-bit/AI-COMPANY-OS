"""
V8-S03 — Mutation Endpoint Auth Tests
All POST/PATCH/DELETE must require authentication.
Previously hidden by Sprint 302 middleware — now enforced per-endpoint.
"""
import pytest
import requests

BASE = "http://localhost:8030"

MUTATION_ENDPOINTS = [
    ("POST",   "/api/v1/leads/",       {"name":"sec-test","email":"t@t.com"}),
    ("POST",   "/api/v1/work-orders/", {"title":"sec-test"}),
    ("POST",   "/api/v1/contracts/",   {"title":"sec-test"}),
    ("POST",   "/api/v1/assets/",      {"name":"sec-test"}),
]

class TestMutationAuth:
    def test_leads_post_requires_auth(self):
        r = requests.post(f"{BASE}/api/v1/leads/",
                         json={"name":"test","email":"t@t.com"}, timeout=5)
        assert r.status_code in (401, 403), \
            f"SECURITY: Leads POST returned {r.status_code} without auth"

    def test_work_orders_post_requires_auth(self):
        r = requests.post(f"{BASE}/api/v1/work-orders/",
                         json={"title":"test"}, timeout=5)
        assert r.status_code in (401, 403)

    def test_contracts_post_requires_auth(self):
        r = requests.post(f"{BASE}/api/v1/contracts/",
                         json={"title":"test"}, timeout=5)
        assert r.status_code in (401, 403)

    def test_authenticated_leads_post_works(self, auth_headers):
        r = requests.post(f"{BASE}/api/v1/leads/",
                         headers=auth_headers,
                         json={"name":"auth-test","email":"auth@test.com"},
                         timeout=10)
        assert r.status_code in (200, 201, 422), \
            f"Authenticated lead creation should work: {r.status_code}"
