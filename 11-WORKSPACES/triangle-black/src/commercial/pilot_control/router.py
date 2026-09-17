"""
V10-011: Pilot Control Router
Day 0 baseline capture + week-by-week progress + ROI measurement.
"""
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.auth import get_current_user
from src.core.tenant import get_hotel_id
from src.commercial.pilot_control.baseline import PilotBaselineService

router = APIRouter(prefix="/pilot", tags=["pilot"])


@router.get("/status", summary="Pilot program status")
def get_pilot_status(
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Overall pilot status — links to baseline, onboarding, and intelligence."""
    svc = PilotBaselineService(db, hotel_id)
    baseline = svc.capture_baseline()

    # Determine pilot phase based on data quality
    wo_linkage = baseline["work_orders"]["asset_linkage_pct"]
    pm_compliance = baseline["maintenance"]["pm_compliance_pct"]
    scores = baseline["pilot_scores"]

    phase = "data_import" if wo_linkage < 20 else \
            "operational_control" if scores["operational_control"] < 60 else \
            "intelligence" if wo_linkage < 60 else \
            "optimization"

    return {
        "hotel_id": hotel_id,
                "phase": phase,
                "pilot_phase": phase,
        "phase_description": {
            "data_import": "Import assets, PM plans, and WO history to unlock intelligence",
            "operational_control": "Focus on critical WOs, unassigned WOs, overdue PM",
            "intelligence": "AI recommendations active — review and act on priorities",
            "optimization": "Measure ROI and document improvements",
        }.get(phase, "Unknown"),
        "scores": scores,
        "key_metrics": {
            "wo_asset_linkage": f"{wo_linkage}%",
            "pm_compliance": f"{pm_compliance}%",
            "critical_open": baseline["work_orders"]["critical_open"],
            "overdue_pm": baseline["maintenance"]["pm_overdue"],
        },
        "next_actions": _get_next_actions(baseline),
    }


@router.get("/baseline", summary="Capture Day 0 baseline KPIs")
def capture_baseline(
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    V10-011: Capture complete operational baseline.
    Call on Day 0 of pilot to establish before-state.
    Save the response — use it for week-by-week comparison.
    """
    svc = PilotBaselineService(db, hotel_id)
    return svc.capture_baseline()


@router.get("/roi", summary="Pilot ROI measurement")
def get_pilot_roi(
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    V10-011: Current operational state vs pilot start potential.
    Shows measurable improvements and ROI evidence.
    """
    svc = PilotBaselineService(db, hotel_id)
    current = svc.capture_baseline()

    # What an ideal state looks like (targets)
    targets = {
        "critical_open_wos": 0,
        "unassigned_wos": 0,
        "pm_overdue": 0,
        "pm_compliance_pct": 90,
        "wo_asset_linkage_pct": 80,
        "ai_acceptance_pct": 25,
    }

    actual = {
        "critical_open_wos": current["work_orders"]["critical_open"],
        "unassigned_wos": current["work_orders"]["unassigned"],
        "pm_overdue": current["maintenance"]["pm_overdue"],
        "pm_compliance_pct": current["maintenance"]["pm_compliance_pct"],
        "wo_asset_linkage_pct": current["work_orders"]["asset_linkage_pct"],
        "ai_acceptance_pct": current["intelligence"]["ai_acceptance_pct"],
    }

    gaps = {}
    for metric, target in targets.items():
        actual_val = actual.get(metric, 0)
        if metric in ["critical_open_wos", "unassigned_wos", "pm_overdue"]:
            # Lower is better
            gaps[metric] = {"actual": actual_val, "target": target, "gap": actual_val - target}
        else:
            # Higher is better
            gaps[metric] = {"actual": actual_val, "target": target, "gap": target - actual_val}

    return {
        "hotel_id": hotel_id,
        "measurement_date": current["capture_date"],
        "current_state": actual,
        "targets": targets,
        "gaps": gaps,
        "roi_narrative": _build_roi_narrative(actual, targets, current),
        "data_confidence": current["data_quality"]["intelligence_confidence"],
        "confidence_note": current["data_quality"]["primary_gap"],
    }


@router.get("/checklist", summary="Pilot readiness checklist")
def get_pilot_checklist(
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    V10-011: 30-day pilot readiness checklist.
    Shows what's done, what's pending, and what to do next.
    """
    svc = PilotBaselineService(db, hotel_id)
    baseline = svc.capture_baseline()

    wo = baseline["work_orders"]
    maint = baseline["maintenance"]
    assets = baseline["assets"]
    intel = baseline["intelligence"]

    checklist = [
        {
            "phase": "Day 0: Data Import",
            "items": [
                {"task": "Assets imported", "done": assets["total"] > 10,
                 "value": f"{assets['total']} assets"},
                {"task": "PM plans imported", "done": maint["pm_total"] > 5,
                 "value": f"{maint['pm_total']} plans"},
                {"task": "Suppliers imported", "done": assets["suppliers"] > 3,
                 "value": f"{assets['suppliers']} suppliers"},
                {"task": "WO history available", "done": wo["total"] > 50,
                 "value": f"{wo['total']} WOs"},
                {"task": "WO→Asset linkage >20%", "done": wo["asset_linkage_pct"] >= 20,
                 "value": f"{wo['asset_linkage_pct']}%"},
            ]
        },
        {
            "phase": "Week 1: Operational Control",
            "items": [
                {"task": "Critical WOs < 100", "done": wo["critical_open"] < 100,
                 "value": f"{wo['critical_open']} critical"},
                {"task": "Unassigned WOs < 200", "done": wo["unassigned"] < 200,
                 "value": f"{wo['unassigned']} unassigned"},
                {"task": "PM overdue < 25%", "done": maint["pm_overdue"] < maint["pm_active"] * 0.25,
                 "value": f"{maint['pm_overdue']} overdue"},
            ]
        },
        {
            "phase": "Week 2: Intelligence",
            "items": [
                {"task": "WO→Asset linkage >50%", "done": wo["asset_linkage_pct"] >= 50,
                 "value": f"{wo['asset_linkage_pct']}%"},
                {"task": "AI recommendations reviewed", "done": intel["ai_acceptance_pct"] > 5,
                 "value": f"{intel['ai_acceptance_pct']}% acceptance"},
                {"task": "PM compliance >75%", "done": maint["pm_compliance_pct"] >= 75,
                 "value": f"{maint['pm_compliance_pct']}%"},
            ]
        },
        {
            "phase": "Week 4: ROI",
            "items": [
                {"task": "WO→Asset linkage >70%", "done": wo["asset_linkage_pct"] >= 70,
                 "value": f"{wo['asset_linkage_pct']}%"},
                {"task": "PM compliance >85%", "done": maint["pm_compliance_pct"] >= 85,
                 "value": f"{maint['pm_compliance_pct']}%"},
                {"task": "AI acceptance >15%", "done": intel["ai_acceptance_pct"] >= 15,
                 "value": f"{intel['ai_acceptance_pct']}%"},
            ]
        }
    ]

    total_items = sum(len(p["items"]) for p in checklist)
    done_items = sum(1 for p in checklist for item in p["items"] if item["done"])

    return {
        "hotel_id": hotel_id,
        "completion_pct": round(done_items / max(total_items, 1) * 100),
        "done": done_items,
        "total": total_items,
        "phases": checklist,
        "next_priority": _get_next_priority(checklist),
    }


def _get_next_actions(baseline: dict) -> list:
    actions = []
    wo = baseline["work_orders"]
    maint = baseline["maintenance"]

    if wo["critical_open"] > 0:
        actions.append({
            "priority": "P0",
            "action": f"Assign technicians to {wo['critical_open']} critical WOs",
            "link": "/operations/work-orders?priority=critical"
        })
    if wo["unassigned"] > 100:
        actions.append({
            "priority": "P1",
            "action": f"Assign {wo['unassigned']} unassigned WOs",
            "link": "/operations/work-orders?status=open"
        })
    if maint["pm_overdue"] > 50:
        actions.append({
            "priority": "P1",
            "action": f"Address {maint['pm_overdue']} overdue PM plans",
            "link": "/operations/maintenance"
        })
    if wo["asset_linkage_pct"] < 30:
        actions.append({
            "priority": "P1",
            "action": f"Link WOs to assets (currently {wo['asset_linkage_pct']}%)",
            "link": "/operations/work-orders/new"
        })
    return actions[:5]


def _get_next_priority(checklist: list) -> str:
    for phase in checklist:
        for item in phase["items"]:
            if not item["done"]:
                return f"{phase['phase']}: {item['task']}"
    return "All checklist items complete — pilot ready for ROI report"


def _build_roi_narrative(actual: dict, targets: dict, baseline: dict) -> str:
    lines = []
    crit = actual["critical_open_wos"]
    unassigned = actual["unassigned_wos"]
    pm_over = actual["pm_overdue"]
    linkage = actual["wo_asset_linkage_pct"]

    if crit > 0:
        lines.append(f"{crit} critical WOs still require immediate attention")
    if unassigned > 0:
        lines.append(f"{unassigned} WOs have no assigned technician")
    if pm_over > 0:
        lines.append(f"{pm_over} PM plans are overdue — asset risk increasing")
    if linkage < 50:
        lines.append(f"WO→Asset linkage at {linkage}% — intelligence reliability limited")

    confidence = baseline["data_quality"]["intelligence_confidence"]
    lines.append(f"Data confidence: {confidence}")

    return " | ".join(lines) if lines else "Operational state meets pilot targets"



@router.get("/report/pdf", summary="Executive Pilot Report PDF")
def download_pilot_report(
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Generate executive PDF report: baseline, KPIs, recommendations, ROI.
    Internal ROI clearly labeled as INTERNAL. Customer-verified as VERIFIED (L3+).
    """
    from io import BytesIO
    from datetime import datetime
    try:
        from src.commercial.reports.service import ReportGeneratorService
        svc = ReportGeneratorService(db=db, hotel_id=hotel_id)
        pdf_bytes = svc.generate_pdf()
        buf = BytesIO(pdf_bytes)
        buf.seek(0)
        from fastapi.responses import StreamingResponse
        return StreamingResponse(
            buf,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=triangle-black-pilot-{datetime.utcnow().strftime('%Y%m%d')}.pdf"}
        )
    except Exception as e:
        # Fallback to pilot PDF service
        try:
            from src.commercial.reports.pilot_pdf_service import PilotPdfService
            svc2 = PilotPdfService(db=db, hotel_id=hotel_id)
            pdf_bytes = svc2.generate_pilot_report()
            buf = BytesIO(pdf_bytes)
            buf.seek(0)
            from fastapi.responses import StreamingResponse
            return StreamingResponse(
                buf,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename=triangle-black-pilot-report.pdf"}
            )
        except Exception as e2:
            from fastapi import HTTPException
            raise HTTPException(500, f"PDF generation failed: {str(e)[:100]}")


@router.get("/metrics/canonical", summary="All canonical metrics from metric registry")
def get_canonical_metrics(
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    THE canonical metric endpoint.
    All dashboards, reports, and AI must use these numbers.
    Prevents metric drift across the platform.
    """
    from src.core.metric_registry import MetricService
    svc = MetricService(db=db, hotel_id=hotel_id)
    return svc.get_all_metrics()


@router.get("/metrics/provenance", summary="Data provenance analysis")
def get_data_provenance(
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """
    Analyze data by provenance: REAL | TEST | DEMO | IMPORTED | UNKNOWN.
    Critical for accurate KPI reporting.
    """
    from src.core.data_provenance import DataProvenanceService
    svc = DataProvenanceService(db=db, hotel_id=hotel_id)
    return {
        "classification": svc.classify_wo_provenance(limit=3000),
        "real_linkage": svc.get_real_wo_linkage(),
    }


# ATTENTION LIFECYCLE ENGINE
@router.post("/attention/item", summary="Create attention item with lifecycle")
def create_attention_item(
    payload: dict,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Create a new operational attention item (P0-P3) with full lifecycle tracking."""
    from src.commercial.attention.lifecycle import AttentionLifecycleService
    svc = AttentionLifecycleService(db=db, hotel_id=hotel_id)
    return svc.create_attention_item(
        priority=payload.get("priority", "P2"),
        title=payload.get("title", "Attention Required"),
        description=payload.get("description", ""),
        evidence=payload.get("evidence", ""),
        impact=payload.get("impact", ""),
        entity_type=payload.get("entity_type"),
        entity_id=payload.get("entity_id"),
        owner=payload.get("owner"),
    )


@router.post("/attention/item/{item_id}/transition",
             summary="Transition attention item lifecycle state")
def transition_attention_item(
    item_id: str,
    payload: dict,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """DETECTED → ACKNOWLEDGED → ASSIGNED → IN_PROGRESS → RESOLVED → VERIFIED → CLOSED"""
    from src.commercial.attention.lifecycle import AttentionLifecycleService
    actor = getattr(current_user, "email", None) or getattr(current_user, "name", "unknown")
    svc = AttentionLifecycleService(db=db, hotel_id=hotel_id)
    return svc.transition(
        item_id=item_id,
        new_status=payload.get("status", ""),
        actor=actor,
        notes=payload.get("notes", ""),
        assigned_to=payload.get("assigned_to"),
        resolution=payload.get("resolution"),
    )


@router.get("/attention/lifecycle", summary="Attention lifecycle metrics")
def get_attention_lifecycle(
    priority: str = None,
    current_user=Depends(get_current_user),
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
):
    """Get open attention items with their lifecycle states."""
    from src.commercial.attention.lifecycle import AttentionLifecycleService
    svc = AttentionLifecycleService(db=db, hotel_id=hotel_id)
    return {
        "open_items": svc.get_open_items(priority=priority),
        "lifecycle_metrics": svc.get_lifecycle_metrics(),
    }

