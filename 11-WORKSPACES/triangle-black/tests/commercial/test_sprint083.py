"""Sprint-083: DDD compliance — approval_chain + approval_requests"""
import pytest


def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")


class TestApprovalChainDDD:
    def test_model_importable(self):
        from src.commercial.approval_chain.models import PRApprovalChain
        assert PRApprovalChain.__tablename__ == "pr_approval_chain"
        assert hasattr(PRApprovalChain, "pr_id")

    def test_schemas_importable(self):
        from src.commercial.approval_chain.schemas import ApprovalChainEntry
        e = ApprovalChainEntry(pr_id="test-pr-001")
        assert e.pr_id == "test-pr-001"

    def test_repository_importable(self):
        from src.commercial.approval_chain.repository import get_chain, add_step, update_step
        assert callable(get_chain)
        assert callable(add_step)

    def test_approval_chain_api(self, client, auth_headers):
        res = client.get("/api/v1/approval-chain/pr/test-000", headers=auth_headers)
        _skip_if_rate_limited(res, "chain_api")
        assert res.status_code in (200, 404)


class TestApprovalRequestsDDD:
    def test_model_importable(self):
        from src.commercial.approval_requests.models import ApprovalRequest
        assert ApprovalRequest.__tablename__ == "approval_requests"
        assert hasattr(ApprovalRequest, "hotel_id")

    def test_schemas_importable(self):
        from src.commercial.approval_requests.schemas import ApprovalRequestCreate
        r = ApprovalRequestCreate(entity_type="purchase_request", entity_id="test-001")
        assert r.entity_type == "purchase_request"

    def test_repository_importable(self):
        from src.commercial.approval_requests.repository import get_all, get_by_id, get_pending
        assert callable(get_all)
        assert callable(get_pending)

    def test_approval_requests_api(self, client, auth_headers):
        res = client.get("/api/v1/approval-requests/", headers=auth_headers)
        _skip_if_rate_limited(res, "approval_req_list")
        assert res.status_code in (200, 404)
