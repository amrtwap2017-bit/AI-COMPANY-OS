# 01-COMMERCIAL — Implementation Checklist

## Backend

- [ ] Lead module (model, service, controller, DTOs)
- [ ] Company module (extend Phase 5)
- [ ] Contact module
- [ ] Opportunity module (state machine)
- [ ] Site Survey module (file uploads)
- [ ] Quotation module (line items, PDF generation)
- [ ] Contract module (event-driven project creation)
- [ ] Lead scoring service
- [ ] Pipeline forecast service
- [ ] Margin calculator service
- [ ] Duplicate detection service
- [ ] PDF generation service (quotations)
- [ ] Event handlers (lead.converted → opportunity, contract.activated → project)
- [ ] Permission guards for all endpoints

## Frontend

- [ ] Lead list + detail + create screens
- [ ] Pipeline kanban board
- [ ] Opportunity detail screen with tabs
- [ ] Company directory + detail
- [ ] Survey list + execute + review screens
- [ ] Quotation builder (line item editor)
- [ ] Quotation PDF preview
- [ ] Contract list + detail + creation wizard
- [ ] Client portal screens
- [ ] Forecast dashboard

## Infrastructure

- [ ] RBAC seed: sales_rep, sales_manager, engineer, engineering_manager roles
- [ ] Seed data: demo leads, opportunities, sample quotation templates
