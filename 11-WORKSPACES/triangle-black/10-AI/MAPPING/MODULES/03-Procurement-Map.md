# Procurement Module Map

## Scope
Purchase request management, RFQ processing, supplier comparison, purchase order management, goods receipt, returns management, and supplier negotiation.

## Sub-Modules
| Module | Capabilities | Lines of Docs |
|--------|-------------|---------------|
| Purchase Request Management | 5 | 220 |
| RFQ Management | 6 | 280 |
| Purchase Order Management | 6 | 300 |
| Goods Receipt Management | 5 | 210 |
| Returns Management | 5 | 190 |
| Supplier Negotiation | 4 | 170 |

## Documents Consumed (from Program 1)
- `02-DOMAINS/03-Procurement-Domain.md` — Full procurement domain spec
- `03-FEATURES/09-Procurement.md` — Procurement feature spec
- `03-FEATURES/10-RFQ-Management.md` — RFQ management feature spec
- `03-FEATURES/11-Purchase-Orders.md` — Purchase order feature spec

## Documents Produced (to Program 3)
| Artifact | Type | Estimated Count |
|----------|------|----------------|
| Backend modules | NestJS modules | 6 |
| Frontend pages | Next.js pages | 16 |
| Database tables | Prisma models | 14 |
| API endpoints | REST routes | 38 |
| Test files | spec/test files | 48 |

## Key Entities
| Entity | Table | Description |
|--------|-------|-------------|
| PurchaseRequest | PurchaseRequest | Internal purchase request |
| RFQ | RFQ | Request for quotation |
| RFQResponse | RFQResponse | Supplier response to RFQ |
| PurchaseOrder | PurchaseOrder | Purchase order with line items |
| GoodsReceipt | GoodsReceipt | Goods receipt record |
| ReturnOrder | ReturnOrder | Supplier return order |
| Negotiation | Negotiation | Supplier negotiation record |

## Key APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /purchase-requests | GET/POST | List and create PRs |
| /purchase-requests/:id/approve | POST | Approve purchase request |
| /rfqs | GET/POST | List and create RFQs |
| /rfqs/:id/responses | POST | Submit RFQ response |
| /purchase-orders | GET/POST | List and create POs |
| /purchase-orders/:id/approve | POST | Approve purchase order |
| /goods-receipts | GET/POST | List and create goods receipts |
| /goods-receipts/:id/inspect | POST | Inspect received goods |
| /returns | GET/POST | List and create returns |
| /negotiations | GET/POST | List and create negotiations |

## Key Screens
| Route | Components | Purpose |
|-------|-----------|---------|
| /procurement/purchase-requests | PRList, PRForm, PRDetail | Purchase request management |
| /procurement/rfqs | RFQList, RFQForm, RFQDetail | RFQ management |
| /procurement/rfqs/:id/responses | RFQResponseView, ComparisonView | Supplier response comparison |
| /procurement/purchase-orders | POList, POForm, PODetail | Purchase order management |
| /procurement/goods-receipts | GoodsReceiptForm, GoodsReceiptList | Goods receipt processing |
| /procurement/returns | ReturnList, ReturnForm | Returns management |
| /procurement/negotiations | NegotiationList, NegotiationForm | Supplier negotiations |

## AI Agents Involved
| Agent | Responsibility |
|-------|---------------|
| PRAutoApprovalAI | Auto-approve low-value PRs |
| SupplierRecommendationAI | Recommend suppliers for RFQs |
| BidEvaluationAI | Evaluate and compare supplier bids |
| PODeliveryPredictionAI | Predict PO delivery dates |
| ReturnReasonClassificationAI | Classify return reasons |
| NegotiationInsightAI | Provide negotiation insights |

## Estimated Sprint Allocation: 4 sprints

## Dependencies
- Shared Kernel — Strong (base entities, enums)
- Supplier Management — Weak (supplier data for RFQ)
- Inventory — Weak (goods receipt → stock update)
- Financial Control — Weak (PO → budget reservation)

## Quality Gates
- ESLint — Automated linting
- Jest — Unit test coverage ≥ 80%
- Playwright — E2E for PR→RFQ→PO flow
- Prisma — Schema validation
