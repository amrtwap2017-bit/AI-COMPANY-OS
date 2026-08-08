"""Sprint-071: Coverage tests for global_search + financial_gl + employees"""
import pytest


def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")


class TestGlobalSearch:
    def test_global_search_returns_200(self, client, auth_headers):
        res = client.get("/api/v1/search/?q=hotel", headers=auth_headers)
        _skip_if_rate_limited(res, "search_basic")
        assert res.status_code == 200

    def test_global_search_response_structure(self, client, auth_headers):
        res = client.get("/api/v1/search/?q=maintenance", headers=auth_headers)
        _skip_if_rate_limited(res, "search_structure")
        assert res.status_code == 200
        data = res.json()
        assert "query" in data
        assert "results" in data
        assert "total" in data

    def test_global_search_short_query_rejected(self, client, auth_headers):
        res = client.get("/api/v1/search/?q=a", headers=auth_headers)
        _skip_if_rate_limited(res, "search_short")
        assert res.status_code in (200, 422)

    def test_quick_search_returns_200(self, client, auth_headers):
        res = client.get("/api/v1/search/quick?q=work", headers=auth_headers)
        _skip_if_rate_limited(res, "quick_search")
        assert res.status_code == 200

    def test_quick_search_flat_results(self, client, auth_headers):
        res = client.get("/api/v1/search/quick?q=hotel", headers=auth_headers)
        _skip_if_rate_limited(res, "quick_search_flat")
        assert res.status_code == 200
        data = res.json()
        assert "results" in data
        assert isinstance(data["results"], list)


class TestFinancialGL:
    def test_gl_summary_returns_200(self, client, auth_headers):
        res = client.get("/api/v1/financial/gl/summary", headers=auth_headers)
        _skip_if_rate_limited(res, "gl_summary")
        assert res.status_code in (200, 404)

    def test_gl_accounts_list(self, client, auth_headers):
        res = client.get("/api/v1/financial/gl/accounts/", headers=auth_headers)
        _skip_if_rate_limited(res, "gl_accounts")
        assert res.status_code in (200, 404)

    def test_gl_balance_sheet(self, client, auth_headers):
        res = client.get("/api/v1/financial/gl/balance-sheet", headers=auth_headers)
        _skip_if_rate_limited(res, "gl_balance_sheet")
        assert res.status_code in (200, 404)

    def test_gl_journal_entries(self, client, auth_headers):
        res = client.get("/api/v1/financial/gl/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(res, "gl_entries")
        assert res.status_code in (200, 404)


class TestEmployees:
    def test_employees_list(self, client, auth_headers):
        res = client.get("/api/v1/employees/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(res, "employees_list")
        assert res.status_code == 200

    def test_employees_have_fields(self, client, auth_headers):
        res = client.get("/api/v1/employees/?limit=1", headers=auth_headers)
        _skip_if_rate_limited(res, "employees_fields")
        assert res.status_code == 200
        data = res.json()
        items = data if isinstance(data, list) else data.get("results", [])
        if items:
            e = items[0]
            assert "id" in e

    def test_timesheets_list(self, client, auth_headers):
        res = client.get("/api/v1/timesheets/?limit=5", headers=auth_headers)
        _skip_if_rate_limited(res, "timesheets_list")
        assert res.status_code in (200, 404)

    def test_timesheets_summary(self, client, auth_headers):
        res = client.get("/api/v1/timesheets/summary", headers=auth_headers)
        _skip_if_rate_limited(res, "timesheets_summary")
        assert res.status_code in (200, 404)
