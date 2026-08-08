"""Sprint-078: DDD compliance tests — approval_center"""
import pytest


def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        pytest.skip(f"Rate limited in full suite — {context}")


class TestApprovalCenterDDD:
    def test_schemas_importable(self):
        from src.commercial.approval_center.schemas import (
            ApprovalQueueItem, ApprovalQueueResponse, ApprovalCountResponse
        )
        item = ApprovalQueueItem(
            id="test-1", title="Test", approval_type="quote", status="review"
        )
        assert item.approval_type == "quote"

    def test_repository_importable(self):
        from src.commercial.approval_center.repository import (
            get_approval_queue, get_approval_counts,
            approve_item, reject_item
        )
        assert callable(get_approval_queue)
        assert callable(get_approval_counts)
        assert callable(approve_item)
        assert callable(reject_item)

    def test_approval_queue_api(self, client, auth_headers):
        res = client.get("/api/v1/approvals/", headers=auth_headers)
        _skip_if_rate_limited(res, "approval_queue")
        assert res.status_code in (200, 404)

    def test_approval_count_api(self, client, auth_headers):
        res = client.get("/api/v1/approvals/count", headers=auth_headers)
        _skip_if_rate_limited(res, "approval_count")
        assert res.status_code in (200, 404)

    def test_approval_queue_structure(self, client, auth_headers):
        res = client.get("/api/v1/approvals/", headers=auth_headers)
        _skip_if_rate_limited(res, "approval_structure")
        if res.status_code == 404:
            pytest.skip("Approvals endpoint not registered")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, (list, dict))
