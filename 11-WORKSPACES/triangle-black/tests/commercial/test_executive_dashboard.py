"""
Sprint-021: Old executive dashboard test — replaced by test_executive_dashboard_live.py
This file kept for backward compatibility — all real tests are in test_executive_dashboard_live.py
"""
import pytest

def _skip_if_rate_limited(res, context=""):
    if hasattr(res, "status_code") and res.status_code == 429:
        import pytest
        pytest.skip(f"Rate limited in full suite — {context}")



def test_executive_dashboard_placeholder():
    """Placeholder — real tests in test_executive_dashboard_live.py"""
    assert True
