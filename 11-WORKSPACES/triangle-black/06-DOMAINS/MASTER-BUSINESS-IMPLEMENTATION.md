# Master Business Implementation

## Revenue Generation Sequence

Triangle Black earns revenue in this order:
1. **CRM** captures leads → **Opportunities** qualify them
2. **Site Surveys** assess feasibility → **Quotations** price the work
3. **Contracts** lock the deal → **Projects** execute it
4. **Procurement** sources materials → **Inventory** manages them
5. **Suppliers** deliver → **Finance** tracks profitability

Every module after the first exists because the previous module generated revenue that needs to be managed.

## Cross-Module Traceability

```
Lead → Company → Contact → Site Survey → Quotation → Contract → Project
                                                                      ↓
                                                            Purchase Request → RFQ → PO → Goods Receipt → Stock
                                                                                                          ↓
                                                                                                    Consumption (Project)
                                                                                                          ↓
                                                                                                    Invoice → Payment
```

## Architecture Invariants

| Rule | Enforcement |
|------|-------------|
| A quotation cannot exist without an opportunity | FK constraint |
| A project cannot exist without a contract | FK constraint |
| A purchase order cannot exist without a project | FK constraint |
| Consumption deducts from inventory | Transactional |
| Revenue recognizes on milestone approval | Event-driven |
| Margin calculates at quotation, tracks through delivery | Continuous |

## Module Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Complete | Ready for implementation |
| 🔧 In Progress | Being drafted |
| 📋 Planned | Spec written, not started |
| 🔮 Future | V2 or later |
