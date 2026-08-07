"""
Tests for the core business revenue loop:
  create → qualify → assign → generate quote →
  submit → send → approve → contract created
"""
import uuid
import pytest


@pytest.fixture(scope="module")
def revenue_loop_lead(client, auth_headers):
    """Create a fresh lead for revenue loop testing."""
    unique = str(uuid.uuid4())[:8]
    res = client.post(
        "/api/v1/leads/",
        json={
            "name": f"PYTEST-LOOP Hotel {unique}",
            "email": f"loop_{unique}@pytest-loop.com",
            "company": f"Pytest Loop Hotels {unique}",
            "source": "referral",
            "priority": "high",
            "phone": "+201234567890",
            "notes": "HVAC electrical plumbing fire fighting maintenance needed",
        },
        headers=auth_headers,
    )
    assert res.status_code == 201
    lead_id = res.json()["id"]
    yield lead_id
    try:
        client.delete(f"/api/v1/leads/{lead_id}", headers=auth_headers)
    except Exception:
        pass


class TestQualify:
    def test_qualify_lead(self, client, auth, revenue_loop_lead):
        res = client.post(
            f"/api/v1/actions/leads/{revenue_loop_lead}/qualify",
            headers=auth_headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        assert "score" in data
        assert data["score"] > 0
        assert data["grade"] in ("qualified", "warm", "cold")

    def test_qualify_updates_lead_status(self, client, auth, revenue_loop_lead):
        lead = client.get(
            f"/api/v1/leads/{revenue_loop_lead}", headers=auth_headers
        ).json()
        assert lead["status"] == "qualified"
        assert int(lead["score"]) > 0

    def test_qualify_nonexistent_lead(self, client, auth):
        res = client.post(
            "/api/v1/actions/leads/nonexistent-000/qualify",
            headers=auth_headers,
        )
        assert res.status_code == 404


class TestAssign:
    def test_assign_lead(self, client, auth, revenue_loop_lead):
        res = client.post(
            f"/api/v1/actions/leads/{revenue_loop_lead}/assign",
            json={},
            headers=auth_headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        assert "agent_id" in data
        assert "agent_name" in data

    def test_assign_updates_lead_status(self, client, auth, revenue_loop_lead):
        lead = client.get(
            f"/api/v1/leads/{revenue_loop_lead}", headers=auth_headers
        ).json()
        assert lead["status"] == "assigned"


class TestGenerateQuote:
    def test_generate_quote_from_lead(self, client, auth, revenue_loop_lead):
        res = client.post(
            f"/api/v1/actions/leads/{revenue_loop_lead}/quote",
            json={"contract_months": 12},
            headers=auth_headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert "quote_id" in data
        assert data["total"] > 0

    def test_generated_quote_exists(self, client, auth, revenue_loop_lead):
        res = client.post(
            f"/api/v1/actions/leads/{revenue_loop_lead}/quote",
            json={"contract_months": 12},
            headers=auth_headers,
        )
        quote_id = res.json()["quote_id"]
        quote = client.get(f"/api/v1/quotes/{quote_id}", headers=auth_headers).json()
        assert quote["status"] == "draft"
        assert len(quote["items"]) > 0


class TestFullRevenueLoop:
    """Test the complete path: draft → review → sent → approved → contract."""

    @pytest.fixture(scope="class")
    def quote_id(self, client, auth, revenue_loop_lead):
        res = client.post(
            f"/api/v1/actions/leads/{revenue_loop_lead}/quote",
            json={"contract_months": 12},
            headers=auth_headers,
        )
        assert res.status_code == 200
        return res.json()["quote_id"]

    def test_submit_quote(self, client, auth, quote_id):
        res = client.post(
            f"/api/v1/actions/quotes/{quote_id}/submit",
            json={},
            headers=auth_headers,
        )
        assert res.status_code == 200
        assert res.json()["status"] == "review"

    def test_send_quote(self, client, auth, quote_id):
        res = client.post(
            f"/api/v1/actions/quotes/{quote_id}/send",
            json={},
            headers=auth_headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "sent"
        assert "email_queued" in data

    def test_approve_quote_creates_contract(self, client, auth, quote_id):
        res = client.post(
            f"/api/v1/actions/quotes/{quote_id}/approve",
            json={},
            headers=auth_headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "approved"
        assert "contract_id" in data
        assert data["contract_id"] is not None

        contract = client.get(
            f"/api/v1/contracts/{data['contract_id']}", headers=auth_headers
        ).json()
        assert contract["status"] == "pending_signature"
        assert contract["total_value"] > 0

    def test_lead_converted_after_approval(self, client, auth, revenue_loop_lead):
        lead = client.get(
            f"/api/v1/leads/{revenue_loop_lead}", headers=auth_headers
        ).json()
        assert lead["status"] in ("converted", "assigned"), f"Unexpected status: {lead['status']}"


class TestRejectFlow:
    def test_reject_sent_quote(self, client, auth):
        unique = str(uuid.uuid4())[:8]
        lead_res = client.post(
            "/api/v1/leads/",
            json={
                "name": f"PYTEST-REJECT {unique}",
                "email": f"reject_{unique}@pytest.com",
                "company": "Reject Test",
                "source": "web",
                "priority": "low",
            },
            headers=auth_headers,
        )
        lead_id = lead_res.json()["id"]

        client.post(f"/api/v1/actions/leads/{lead_id}/qualify", headers=auth_headers)
        client.post(f"/api/v1/actions/leads/{lead_id}/assign", json={}, headers=auth_headers)

        quote_res = client.post(
            f"/api/v1/actions/leads/{lead_id}/quote",
            json={"contract_months": 12},
            headers=auth_headers,
        )
        quote_id = quote_res.json()["quote_id"]

        client.post(f"/api/v1/actions/quotes/{quote_id}/submit", json={}, headers=auth_headers)
        client.post(f"/api/v1/actions/quotes/{quote_id}/send", json={}, headers=auth_headers)

        reject_res = client.post(
            f"/api/v1/actions/quotes/{quote_id}/reject",
            json={"note": "Budget too high for pytest test"},
            headers=auth_headers,
        )
        assert reject_res.status_code == 200
        assert reject_res.json()["status"] == "rejected"

        lead = client.get(f"/api/v1/leads/{lead_id}", headers=auth_headers).json()
        assert lead["status"] == "lost"

        client.delete(f"/api/v1/leads/{lead_id}", headers=auth_headers)
