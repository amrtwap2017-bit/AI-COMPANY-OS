"""
Triangle Black — Asset Operational Health Score Calculator
Domain rule: score is CALCULATED, not user-supplied.
Range: 0-100 (100 = perfect operational condition)
"""
from datetime import datetime, date
from typing import Optional


def calculate_asset_health_score(
    status: Optional[str] = None,
    criticality: Optional[str] = None,
    last_maintenance_date: Optional[date] = None,
    warranty_expiry: Optional[date] = None,
    installation_date: Optional[date] = None,
    override_score: Optional[int] = None,
) -> int:
    """
    Calculate an asset's operational health score (0-100).

    Rules (applied in order, cumulative deductions from 100):
    - out_of_service status     → -60
    - needs_repair status       → -30
    - maintenance status        → -10
    - critical + not operational → -20
    - no maintenance in 90+ days → -15
    - warranty expired           → -5
    - age > 10 years             → -5

    Returns integer in range [0, 100].
    """
    # If an explicit override is provided (e.g., from CSV), use it
    if override_score is not None:
        return max(0, min(100, int(override_score)))

    score = 100
    today = date.today()

    # Status deductions
    status_lower = (status or 'operational').lower()
    if status_lower in ('out_of_service', 'decommissioned', 'retired'):
        score -= 60
    elif status_lower in ('needs_repair', 'broken', 'failed'):
        score -= 30
    elif status_lower in ('maintenance', 'in_maintenance', 'under_maintenance'):
        score -= 10

    # Criticality penalty when not operational
    if criticality and criticality.lower() == 'critical':
        if status_lower not in ('operational', 'active', 'running', 'good'):
            score -= 20

    # Maintenance recency penalty
    if last_maintenance_date:
        if isinstance(last_maintenance_date, datetime):
            last_maint = last_maintenance_date.date()
        else:
            last_maint = last_maintenance_date
        days_since = (today - last_maint).days
        if days_since > 180:
            score -= 15
        elif days_since > 90:
            score -= 8

    # Warranty expiry penalty
    if warranty_expiry:
        if isinstance(warranty_expiry, datetime):
            expiry = warranty_expiry.date()
        else:
            expiry = warranty_expiry
        if expiry < today:
            score -= 5

    # Age penalty (assets older than 10 years)
    if installation_date:
        if isinstance(installation_date, datetime):
            install = installation_date.date()
        else:
            install = installation_date
        age_years = (today - install).days / 365.25
        if age_years > 15:
            score -= 10
        elif age_years > 10:
            score -= 5

    return max(0, min(100, score))


def score_from_csv_row(row: dict) -> int:
    """
    Extract or calculate score from a CSV import row.
    If 'score' or 'health_score' column present → use it.
    Otherwise → calculate from available fields.
    """
    # Check for explicit score columns
    for col in ('score', 'health_score', 'condition_score', 'asset_score'):
        if col in row and row[col] is not None:
            try:
                return max(0, min(100, int(float(str(row[col])))))
            except (ValueError, TypeError):
                pass

    # Parse dates
    def parse_date(val) -> Optional[date]:
        if not val:
            return None
        try:
            return datetime.strptime(str(val).strip(), '%Y-%m-%d').date()
        except ValueError:
            try:
                return datetime.strptime(str(val).strip(), '%d/%m/%Y').date()
            except ValueError:
                return None

    return calculate_asset_health_score(
        status=row.get('status'),
        criticality=row.get('criticality'),
        last_maintenance_date=parse_date(row.get('last_maintenance_date')),
        warranty_expiry=parse_date(row.get('warranty_expiry')),
        installation_date=parse_date(row.get('installation_date')),
    )
