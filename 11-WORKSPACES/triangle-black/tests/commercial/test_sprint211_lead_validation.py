"""Sprint-211: Lead schema validation tests"""
import pytest
from pydantic import ValidationError

def test_lead_create_valid():
    from src.commercial.lead_management.schemas import LeadCreate
    l = LeadCreate(name="Ahmed Hassan", email="ahmed@company.com", source="referral", priority="high")
    assert l.name == "Ahmed Hassan"
    assert l.email == "ahmed@company.com"
    assert l.source == "referral"
    assert l.priority == "high"
    assert l.status == "new"
    assert l.score == 0

def test_lead_create_normalises_priority():
    from src.commercial.lead_management.schemas import LeadCreate
    l = LeadCreate(name="Test Lead", priority="HIGH")
    assert l.priority == "high"

def test_lead_create_normalises_status():
    from src.commercial.lead_management.schemas import LeadCreate
    l = LeadCreate(name="Test Lead", status="QUALIFIED")
    assert l.status == "qualified"

def test_lead_create_normalises_source():
    from src.commercial.lead_management.schemas import LeadCreate
    l = LeadCreate(name="Test Lead", source="WEBSITE")
    assert l.source == "website"

def test_lead_create_normalises_email():
    from src.commercial.lead_management.schemas import LeadCreate
    l = LeadCreate(name="Test Lead", email="  AMR@COMPANY.COM  ")
    assert l.email == "amr@company.com"

def test_lead_create_rejects_invalid_priority():
    from src.commercial.lead_management.schemas import LeadCreate
    with pytest.raises(ValidationError) as exc:
        LeadCreate(name="Test", priority="urgent")
    assert "priority" in str(exc.value).lower()

def test_lead_create_rejects_invalid_status():
    from src.commercial.lead_management.schemas import LeadCreate
    with pytest.raises(ValidationError) as exc:
        LeadCreate(name="Test", status="converted")
    assert "status" in str(exc.value).lower()

def test_lead_create_rejects_invalid_source():
    from src.commercial.lead_management.schemas import LeadCreate
    with pytest.raises(ValidationError) as exc:
        LeadCreate(name="Test", source="magic")
    assert "source" in str(exc.value).lower()

def test_lead_create_rejects_invalid_email():
    from src.commercial.lead_management.schemas import LeadCreate
    with pytest.raises(ValidationError):
        LeadCreate(name="Test", email="not-an-email")

def test_lead_create_rejects_short_name():
    from src.commercial.lead_management.schemas import LeadCreate
    with pytest.raises(ValidationError):
        LeadCreate(name="A")

def test_lead_create_rejects_blank_name():
    from src.commercial.lead_management.schemas import LeadCreate
    with pytest.raises(ValidationError):
        LeadCreate(name="   ")

def test_lead_create_rejects_score_too_high():
    from src.commercial.lead_management.schemas import LeadCreate
    with pytest.raises(ValidationError):
        LeadCreate(name="Test", score=101)

def test_lead_create_rejects_negative_score():
    from src.commercial.lead_management.schemas import LeadCreate
    with pytest.raises(ValidationError):
        LeadCreate(name="Test", score=-1)

def test_lead_create_accepts_max_score():
    from src.commercial.lead_management.schemas import LeadCreate
    l = LeadCreate(name="Hot Lead", score=100)
    assert l.score == 100

def test_lead_update_allows_partial():
    from src.commercial.lead_management.schemas import LeadUpdate
    upd = LeadUpdate(status="won", score=95)
    assert upd.status == "won"
    assert upd.score == 95
    assert upd.name is None

def test_lead_update_rejects_invalid_status():
    from src.commercial.lead_management.schemas import LeadUpdate
    with pytest.raises(ValidationError):
        LeadUpdate(status="closed")

def test_lead_update_rejects_invalid_priority():
    from src.commercial.lead_management.schemas import LeadUpdate
    with pytest.raises(ValidationError):
        LeadUpdate(priority="extreme")

def test_lead_update_normalises_email():
    from src.commercial.lead_management.schemas import LeadUpdate
    upd = LeadUpdate(email="  AHMED@CO.COM  ")
    assert upd.email == "ahmed@co.com"

def test_lead_response_accepts_none_fields():
    from src.commercial.lead_management.schemas import LeadResponse
    resp = LeadResponse()
    assert resp.name is None
    assert resp.score is None

def test_valid_lead_statuses():
    from src.commercial.lead_management.schemas import VALID_LEAD_STATUSES
    assert "new" in VALID_LEAD_STATUSES
    assert "qualified" in VALID_LEAD_STATUSES
    assert "won" in VALID_LEAD_STATUSES
    assert "lost" in VALID_LEAD_STATUSES

def test_valid_lead_sources():
    from src.commercial.lead_management.schemas import VALID_LEAD_SOURCES
    assert "manual" in VALID_LEAD_SOURCES
    assert "referral" in VALID_LEAD_SOURCES
    assert "website" in VALID_LEAD_SOURCES
    assert "exhibition" in VALID_LEAD_SOURCES
