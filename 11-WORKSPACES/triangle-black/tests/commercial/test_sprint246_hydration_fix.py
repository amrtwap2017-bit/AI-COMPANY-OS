"""Sprint-246: Hydration mismatch fix — assets/supply-chain/analytics pages"""
from pathlib import Path

BASE = Path("/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal/app/(app)/(enterprise)")

def _read(page):
    return (BASE / page).read_text()

# ── Assets page ───────────────────────────────────────────────────────────────
def test_assets_page_has_mounted_state():
    text = _read("maintenance/assets/page.tsx")
    assert "mounted" in text
    assert "setMounted" in text

def test_assets_page_has_mounted_effect():
    text = _read("maintenance/assets/page.tsx")
    assert "setMounted(true)" in text

def test_assets_page_no_bare_isloading_return():
    text = _read("maintenance/assets/page.tsx")
    assert "if (isLoading) return <div" not in text

def test_assets_page_has_mounted_guard():
    text = _read("maintenance/assets/page.tsx")
    assert "!mounted" in text or "mounted === false" in text

# ── Supply-chain page ─────────────────────────────────────────────────────────
def test_supply_chain_page_has_mounted_state():
    text = _read("supply-chain/page.tsx")
    assert "mounted" in text
    assert "setMounted" in text

def test_supply_chain_page_has_mounted_effect():
    text = _read("supply-chain/page.tsx")
    assert "setMounted(true)" in text

def test_supply_chain_page_no_bare_isloading_return():
    text = _read("supply-chain/page.tsx")
    assert "if (isLoading) return <div" not in text

def test_supply_chain_page_has_mounted_guard():
    text = _read("supply-chain/page.tsx")
    assert "!mounted" in text or "mounted === false" in text

# ── Analytics page ────────────────────────────────────────────────────────────
def test_analytics_page_has_mounted_state():
    text = _read("analytics/page.tsx")
    assert "mounted" in text
    assert "setMounted" in text

def test_analytics_page_has_mounted_effect():
    text = _read("analytics/page.tsx")
    assert "setMounted(true)" in text

def test_analytics_page_no_bare_isloading_return():
    text = _read("analytics/page.tsx")
    assert "if (isLoading) return <div" not in text

def test_analytics_page_has_mounted_guard():
    text = _read("analytics/page.tsx")
    assert "!mounted" in text or "mounted === false" in text

# ── All three pages still have use client ─────────────────────────────────────
def test_all_three_pages_have_use_client():
    for pg in [
        "maintenance/assets/page.tsx",
        "supply-chain/page.tsx",
        "analytics/page.tsx",
    ]:
        text = _read(pg)
        assert "'use client'" in text or '"use client"' in text, f"{pg} missing use client"

# ── FeatureGate still present ─────────────────────────────────────────────────
def test_all_three_pages_still_have_feature_gate():
    for pg in [
        "maintenance/assets/page.tsx",
        "supply-chain/page.tsx",
        "analytics/page.tsx",
    ]:
        text = _read(pg)
        assert "FeatureGate" in text, f"{pg} lost FeatureGate"
