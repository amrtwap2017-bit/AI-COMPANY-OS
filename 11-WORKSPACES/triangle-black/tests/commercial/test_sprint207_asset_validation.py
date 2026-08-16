"""Sprint-207: Asset schema validation tests"""
import pytest
from pydantic import ValidationError
from datetime import datetime

def test_asset_create_valid():
    from src.commercial.assets.schemas import AssetCreate
    a = AssetCreate(site_id="site-001", category="HVAC", name="AHU-01 Tower A", criticality="high")
    assert a.name == "AHU-01 Tower A"
    assert a.criticality == "high"

def test_asset_create_normalises_criticality_case():
    from src.commercial.assets.schemas import AssetCreate
    a = AssetCreate(site_id="site-001", category="HVAC", name="AHU-01", criticality="CRITICAL")
    assert a.criticality == "critical"

def test_asset_create_rejects_invalid_criticality():
    from src.commercial.assets.schemas import AssetCreate
    with pytest.raises(ValidationError) as exc:
        AssetCreate(site_id="s1", category="HVAC", name="Test Asset", criticality="urgent")
    assert "criticality" in str(exc.value).lower()

def test_asset_create_rejects_short_name():
    from src.commercial.assets.schemas import AssetCreate
    with pytest.raises(ValidationError):
        AssetCreate(site_id="s1", category="HVAC", name="A")

def test_asset_create_rejects_blank_name():
    from src.commercial.assets.schemas import AssetCreate
    with pytest.raises(ValidationError):
        AssetCreate(site_id="s1", category="HVAC", name="   ")

def test_asset_create_rejects_name_too_long():
    from src.commercial.assets.schemas import AssetCreate
    with pytest.raises(ValidationError):
        AssetCreate(site_id="s1", category="HVAC", name="x" * 501)

def test_asset_create_rejects_invalid_frequency():
    from src.commercial.assets.schemas import AssetCreate
    with pytest.raises(ValidationError) as exc:
        AssetCreate(site_id="s1", category="HVAC", name="Test", service_frequency="often")
    assert "service_frequency" in str(exc.value).lower() or "frequency" in str(exc.value).lower()

def test_asset_create_accepts_valid_frequency():
    from src.commercial.assets.schemas import AssetCreate
    a = AssetCreate(site_id="s1", category="HVAC", name="AHU-01", service_frequency="quarterly")
    assert a.service_frequency == "quarterly"

def test_asset_create_normalises_frequency_case():
    from src.commercial.assets.schemas import AssetCreate
    a = AssetCreate(site_id="s1", category="HVAC", name="AHU-01", service_frequency="MONTHLY")
    assert a.service_frequency == "monthly"

def test_asset_create_accepts_default_criticality():
    from src.commercial.assets.schemas import AssetCreate
    a = AssetCreate(site_id="s1", category="HVAC", name="AHU-01")
    assert a.criticality == "medium"

def test_asset_update_allows_partial():
    from src.commercial.assets.schemas import AssetUpdate
    upd = AssetUpdate(criticality="critical")
    assert upd.criticality == "critical"
    assert upd.name is None

def test_asset_update_rejects_invalid_criticality():
    from src.commercial.assets.schemas import AssetUpdate
    with pytest.raises(ValidationError):
        AssetUpdate(criticality="extreme")

def test_asset_response_accepts_none_fields():
    from src.commercial.assets.schemas import AssetResponse
    resp = AssetResponse()
    assert resp.name is None
    assert resp.criticality is None

def test_valid_criticality_set():
    from src.commercial.assets.schemas import VALID_CRITICALITY
    assert "critical" in VALID_CRITICALITY
    assert "high" in VALID_CRITICALITY
    assert "medium" in VALID_CRITICALITY
    assert "low" in VALID_CRITICALITY

def test_valid_frequency_set():
    from src.commercial.assets.schemas import VALID_FREQUENCY
    assert "monthly" in VALID_FREQUENCY
    assert "quarterly" in VALID_FREQUENCY
    assert "annual" in VALID_FREQUENCY
