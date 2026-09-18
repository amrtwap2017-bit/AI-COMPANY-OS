"""
Startup Route Registry Validation — V15.0 Updated
Detects silent router mounting failures using substring path matching.

KEY LESSON: Routes mounted via try/except blocks in main.py can silently
fail (NameError etc.) and the application continues without them → 404.

This module validates critical routes ARE actually mounted after startup.
Uses substring matching since routes may have different prefix structures.
"""
from __future__ import annotations
import logging

logger = logging.getLogger("tb.startup")

# Critical routes using SUBSTRING matching — more robust than exact path
# Format: (method, path_substring, description)
CRITICAL_ROUTES = [
    # Auth
    ("POST", "auth/login", "Login endpoint"),
    # Operations
    ("GET", "work-orders", "Work orders list"),
    # Pilot
    ("GET", "pilot/baseline", "Pilot baseline"),
    ("GET", "pilot/report/pdf", "PDF report"),
    # Evidence
    ("GET", "evidence/summary", "Evidence summary"),
    # Recommendations
    ("GET", "recommendations", "Recommendations list"),
    # Attention
    ("GET", "attention", "Attention dashboard"),
    # Onboarding
    ("POST", "onboarding/provision", "Onboarding provision"),
    # Data import
    ("POST", "data-import/assets", "Asset import"),
    # User management (new V15 P0)
    ("POST", "users/invite", "User invitation"),
    # SLA events (new V15 P1)
    ("GET", "attention/sla/summary", "SLA summary"),
    # Adoption (new V15 P2)
    ("GET", "adoption/health", "Adoption health"),
    # Health
    ("GET", "health/live", "Health live"),
]


def validate_critical_routes(app, fail_on_missing: bool = False) -> dict:
    """
    Check all critical routes are mounted using substring matching.
    Non-fatal by default — logs WARNING for missing routes.
    """
    try:
        # Collect all mounted routes
        mounted = set()
        for route in app.routes:
            if hasattr(route, "methods") and hasattr(route, "path"):
                for method in (route.methods or []):
                    mounted.add((method.upper(), route.path))

        missing = []
        for method, path_substr, description in CRITICAL_ROUTES:
            # Substring matching — find if any mounted route contains this substring
            found = any(
                m == method and path_substr in p
                for m, p in mounted
            )
            if not found:
                missing.append((method, path_substr, description))
                logger.warning(
                    f"STARTUP WARNING: Critical route not mounted: "
                    f"{method} *{path_substr}* ({description})"
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
                f"Check for NameError/ImportError in router files. "
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
        if fail_on_missing and "Critical routes" in str(e):
            raise
        logger.error(f"STARTUP: Route validation failed: {e}")
        return {"error": str(e), "missing_count": -1}


def get_route_count(app) -> int:
    """Quick count of mounted routes."""
    try:
        return len([r for r in app.routes if hasattr(r, "methods")])
    except Exception:
        return -1
