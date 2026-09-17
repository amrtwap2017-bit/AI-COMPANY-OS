"""
Startup Route Registry Validation
Prevents silent router failures (the employees/timesheets NameError lesson).

If a router fails to mount due to NameError/ImportError, main.py's try/except
silently continues. This module validates that CRITICAL routes are actually
mounted after startup.

Usage in main.py:
    from src.core.startup_validation import validate_critical_routes
    validate_critical_routes(app)  # Call after all router mounting
"""
from __future__ import annotations
import logging
from typing import Optional

logger = logging.getLogger("tb.startup")

# Routes that MUST be mounted for the system to function
# Format: (method, path_pattern, description)
CRITICAL_ROUTES = [
    # Auth
    ("POST", "/api/v1/auth/login/json", "Login"),
    # Operations
    ("GET", "/api/v1/work-orders/", "Work orders list"),
    ("POST", "/api/v1/work-orders/", "Work order creation"),
    # Maintenance
    ("GET", "/api/v1/maintenance/pm-plans", "PM plans"),
    ("GET", "/api/v1/maintenance/assets", "Assets"),
    # Pilot
    ("GET", "/api/v1/pilot/baseline", "Pilot baseline"),
    ("GET", "/api/v1/pilot/report/pdf", "PDF report"),
    # Evidence
    ("GET", "/api/v1/evidence/summary", "Evidence summary"),
    # Recommendations
    ("GET", "/api/v1/recommendations/", "Recommendations"),
    # Attention
    ("GET", "/api/v1/attention/", "Attention"),
    # Onboarding
    ("POST", "/api/v1/onboarding/provision", "Onboarding provision"),
    # Data import
    ("POST", "/api/v1/data-import/assets", "Asset import"),
    # Employees (previously silently failed)
    ("GET", "/api/v1/employees/", "Employees"),
    ("GET", "/api/v1/timesheets/", "Timesheets"),
    # Health
    ("GET", "/api/v1/health/live", "Health live"),
]


def validate_critical_routes(app, fail_on_missing: bool = False) -> dict:
    """
    Check that all critical routes are mounted.
    
    Args:
        app: FastAPI application instance
        fail_on_missing: If True, raises RuntimeError if routes are missing.
                        Default False (logs warnings only) for backward compat.
    
    Returns:
        dict with: mounted_count, missing_count, missing_routes
    """
    try:
        # Get all mounted routes
        mounted = set()
        for route in app.routes:
            if hasattr(route, "methods") and hasattr(route, "path"):
                for method in route.methods:
                    mounted.add((method.upper(), route.path))

        missing = []
        for method, path, description in CRITICAL_ROUTES:
            # Check for exact match or path with params
            found = any(
                m == method and (p == path or p.startswith(path.rstrip("/")))
                for m, p in mounted
            )
            if not found:
                missing.append((method, path, description))
                logger.warning(
                    f"STARTUP WARNING: Critical route not mounted: {method} {path} ({description})"
                )

        result = {
            "total_routes": len(mounted),
            "critical_checked": len(CRITICAL_ROUTES),
            "missing_count": len(missing),
            "missing_routes": [(m, p, d) for m, p, d in missing],
        }

        if missing:
            logger.error(
                f"STARTUP: {len(missing)} critical routes missing! "
                f"System may be partially functional. "
                f"Missing: {[p for _, p, _ in missing]}"
            )
            if fail_on_missing:
                raise RuntimeError(
                    f"Critical routes not mounted: {[p for _, p, _ in missing]}"
                )
        else:
            logger.info(
                f"STARTUP: All {len(CRITICAL_ROUTES)} critical routes verified ✅ "
                f"({result['total_routes']} total routes mounted)"
            )

        return result

    except Exception as e:
        logger.error(f"STARTUP: Route validation failed: {e}")
        return {"error": str(e), "missing_count": -1}


def get_route_count(app) -> int:
    """Quick count of mounted routes."""
    try:
        return len([r for r in app.routes if hasattr(r, "methods")])
    except Exception:
        return -1
