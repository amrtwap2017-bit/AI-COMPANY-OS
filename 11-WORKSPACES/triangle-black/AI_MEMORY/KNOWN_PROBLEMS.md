# KNOWN_PROBLEMS.md — Triangle Black

Update immediately when problems found.
P0 items escalate to Amr immediately.

---

## P0 — Critical Stop Everything

| ID | Area | Problem | Status |
|----|------|---------|--------|
| P0-001 | Security | email_notifications uses hotel_id not tenant_id | Open |
| P0-002 | Security | 20+ repository.py files missing tenant_id filter | Open |
| P0-003 | Architecture | Most modules missing service layer (router calls repository directly) | Open |

---

## P1 — High Priority

| ID | Area | Problem | Owner |
|----|------|---------|-------|
| P1-001 | Tests | 57 test files but most modules have no test directory | QA Agent |
| P1-002 | Tests | python command not found - use python3 | DevOps Agent |
| P1-003 | HR Domain | 0% implemented | Backend Agent |
| P1-004 | Financial GL | 0% implemented | Backend Agent |

---

## P2 — Medium Priority

| ID | Area | Problem |
|----|------|---------|
| P2-001 | Architecture | hotel_id vs tenant_id mixed usage across codebase |
| P2-002 | Tests | Placeholder test files with literal template names |
| P2-003 | Standards | ENGINEERING-STANDARDS.md described wrong pattern |

---

## Modules Missing tenant_id in Queries

Confirmed from security scan:
- src/commercial/sites/repository.py
- src/commercial/webhook_notifications/repository.py
- src/commercial/service_reports/repository.py
- src/commercial/hotels/repository.py
- src/commercial/inventory_items/repository.py
- src/commercial/purchase_orders/repository.py
- src/commercial/service_requests/repository.py
- src/commercial/invoices/repository.py
- src/commercial/documents/repository.py
- src/commercial/pagination/repository.py
- Plus 10+ more from router.py scan

Full list: run audit script in PROMPTS/Security.md

---

## RESOLVED

| ID | Problem | Resolution | Date |
|----|---------|-----------|------|
| B-000 | AI Software Factory missing | Built Phase 0 | Aug 2026 |
