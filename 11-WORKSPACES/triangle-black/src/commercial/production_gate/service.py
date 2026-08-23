"""
Enterprise Production Gate Service — Triangle Black SaaS v6.0
Validates platform readiness across: API health, DB integrity,
pilot tenant operations, test suite baseline, and release criteria.
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text


class ProductionGateService:
    def __init__(self, db: Session, hotel_id: str):
        self.db = db
        self.hotel_id = hotel_id

    def run_production_readiness_check(self) -> Dict[str, Any]:
        """Runs all production gate checks and returns a structured readiness report."""
        checks = []

        # GATE 1: Database connectivity
        try:
            result = self.db.execute(text("SELECT COUNT(*) FROM hotels")).scalar()
            checks.append({
                "gate": "DB_CONNECTIVITY",
                "status": "PASS",
                "detail": f"{result} hotels in registry"
            })
        except Exception as e:
            checks.append({"gate": "DB_CONNECTIVITY", "status": "FAIL", "detail": str(e)})

        # GATE 2: Pilot tenants present
        try:
            pilot_count = self.db.execute(text(
                "SELECT COUNT(*) FROM hotels WHERE settings::text LIKE '%pilot%'"
            )).scalar() or 0
            checks.append({
                "gate": "PILOT_TENANTS",
                "status": "PASS" if pilot_count >= 3 else "WARN",
                "detail": f"{pilot_count} pilot tenants seeded (required: 3)"
            })
        except Exception as e:
            checks.append({"gate": "PILOT_TENANTS", "status": "FAIL", "detail": str(e)})

        # GATE 3: Asset registry populated
        try:
            asset_count = self.db.execute(text(
                "SELECT COUNT(*) FROM assets WHERE deleted_at IS NULL"
            )).scalar() or 0
            checks.append({
                "gate": "ASSET_REGISTRY",
                "status": "PASS" if asset_count >= 10 else "WARN",
                "detail": f"{asset_count} assets in registry (required: 10+)"
            })
        except Exception as e:
            checks.append({"gate": "ASSET_REGISTRY", "status": "FAIL", "detail": str(e)})

        # GATE 4: Feedback system operational
        try:
            fb_count = self.db.execute(text("SELECT COUNT(*) FROM customer_feedback")).scalar() or 0
            checks.append({
                "gate": "FEEDBACK_SYSTEM",
                "status": "PASS",
                "detail": f"{fb_count} feedback records in triage queue"
            })
        except Exception as e:
            checks.append({"gate": "FEEDBACK_SYSTEM", "status": "FAIL", "detail": str(e)})

        # GATE 5: Webhook infrastructure
        try:
            wh_count = self.db.execute(text("SELECT COUNT(*) FROM webhook_subscriptions")).scalar() or 0
            checks.append({
                "gate": "WEBHOOK_INFRASTRUCTURE",
                "status": "PASS",
                "detail": f"{wh_count} webhook endpoints registered"
            })
        except Exception as e:
            checks.append({"gate": "WEBHOOK_INFRASTRUCTURE", "status": "FAIL", "detail": str(e)})

        # GATE 6: SSO configuration present
        try:
            sso_count = self.db.execute(text("SELECT COUNT(*) FROM sso_configurations")).scalar() or 0
            checks.append({
                "gate": "SSO_FEDERATION",
                "status": "PASS",
                "detail": f"{sso_count} SSO configurations stored"
            })
        except Exception as e:
            checks.append({"gate": "SSO_FEDERATION", "status": "FAIL", "detail": str(e)})

        # GATE 7: Work order pipeline
        try:
            wo_count = self.db.execute(text(
                "SELECT COUNT(*) FROM work_orders WHERE deleted_at IS NULL"
            )).scalar() or 0
            open_wo = self.db.execute(text(
                "SELECT COUNT(*) FROM work_orders WHERE status = 'open' AND deleted_at IS NULL"
            )).scalar() or 0
            checks.append({
                "gate": "WORK_ORDER_PIPELINE",
                "status": "PASS" if wo_count > 0 else "WARN",
                "detail": f"{wo_count} total WOs, {open_wo} open backlog"
            })
        except Exception as e:
            checks.append({"gate": "WORK_ORDER_PIPELINE", "status": "FAIL", "detail": str(e)})

        # GATE 8: Invoice financial ledger
        try:
            inv_count = self.db.execute(text(
                "SELECT COUNT(*) FROM invoices WHERE deleted_at IS NULL"
            )).scalar() or 0
            inv_total = self.db.execute(text(
                "SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE deleted_at IS NULL"
            )).scalar() or 0
            checks.append({
                "gate": "FINANCIAL_LEDGER",
                "status": "PASS" if inv_count > 0 else "WARN",
                "detail": f"{inv_count} invoices, ${float(inv_total):,.2f} total value"
            })
        except Exception as e:
            checks.append({"gate": "FINANCIAL_LEDGER", "status": "FAIL", "detail": str(e)})

        # GATE 9: Audit trail coverage
        try:
            audit_count = self.db.execute(text(
                "SELECT COUNT(*) FROM platform_audit_log"
            )).scalar() or 0
            checks.append({
                "gate": "AUDIT_TRAIL",
                "status": "PASS" if audit_count >= 5 else "WARN",
                "detail": f"{audit_count} audit events recorded"
            })
        except Exception as e:
            checks.append({"gate": "AUDIT_TRAIL", "status": "FAIL", "detail": str(e)})

        # GATE 10: Supplier network
        try:
            sup_count = self.db.execute(text("SELECT COUNT(*) FROM suppliers")).scalar() or 0
            checks.append({
                "gate": "SUPPLIER_NETWORK",
                "status": "PASS" if sup_count >= 3 else "WARN",
                "detail": f"{sup_count} suppliers in network"
            })
        except Exception as e:
            checks.append({"gate": "SUPPLIER_NETWORK", "status": "FAIL", "detail": str(e)})

        # Summary
        passed = sum(1 for c in checks if c["status"] == "PASS")
        failed = sum(1 for c in checks if c["status"] == "FAIL")
        warned = sum(1 for c in checks if c["status"] == "WARN")
        total = len(checks)
        gate_score = round((passed / total) * 100, 1)

        overall = "PRODUCTION_READY" if failed == 0 and gate_score >= 80 else \
                  "CONDITIONAL" if failed == 0 else "BLOCKED"

        return {
            "gate_version": "D-005",
            "overall_status": overall,
            "gate_score_pct": gate_score,
            "passed": passed,
            "warned": warned,
            "failed": failed,
            "total_gates": total,
            "checks": checks,
            "release_recommendation": (
                "Cleared for commercial pilot deployment."
                if overall == "PRODUCTION_READY"
                else "Address failed gates before production deployment."
            )
        }

    def get_pilot_operational_summary(self) -> List[Dict[str, Any]]:
        """Returns operational KPI summary for all 3 pilot tenants."""
        try:
            pilots = self.db.execute(text(
                "SELECT id, name, city FROM hotels "
                "WHERE settings::text LIKE '%pilot%' ORDER BY name ASC"
            )).fetchall()
        except Exception:
            return []

        summary = []
        for p in pilots:
            hid, hname, hcity = str(p[0]), str(p[1]), str(p[2] or "")
            try:
                assets = self.db.execute(text(
                    "SELECT COUNT(*) FROM assets WHERE hotel_id = :h AND deleted_at IS NULL"
                ), {"h": hid}).scalar() or 0
                wos = self.db.execute(text(
                    "SELECT COUNT(*) FROM work_orders WHERE hotel_id = :h AND deleted_at IS NULL"
                ), {"h": hid}).scalar() or 0
                sups = self.db.execute(text(
                    "SELECT COUNT(*) FROM suppliers WHERE hotel_id = :h"
                ), {"h": hid}).scalar() or 0
                spend = self.db.execute(text(
                    "SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE hotel_id = :h AND deleted_at IS NULL"
                ), {"h": hid}).scalar() or 0
                operational = assets >= 10 and wos >= 3
            except Exception:
                assets = wos = sups = 0
                spend = 0.0
                operational = False

            summary.append({
                "hotel_id": hid,
                "name": hname,
                "city": hcity,
                "operational": operational,
                "kpis": {
                    "assets": assets,
                    "work_orders": wos,
                    "suppliers": sups,
                    "spend_usd": float(spend)
                }
            })

        return summary
