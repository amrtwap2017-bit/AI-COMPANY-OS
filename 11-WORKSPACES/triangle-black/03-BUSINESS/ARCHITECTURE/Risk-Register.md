---
ID: 02-Business-12
Title: Risk-Register
Purpose: Identify, assess, and plan mitigation for business risks
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Risk Register

## Risk Scoring Methodology

- **Probability:** 1 (Very Low) to 5 (Almost Certain)
- **Impact:** 1 (Negligible) to 5 (Critical)
- **Score:** Probability × Impact (Max 25)
- **Rating:** 1-6 Low, 7-12 Medium, 13-18 High, 19-25 Very High

---

## Financial Risks

| ID | Risk | Description | Probability | Impact | Score | Rating | Mitigation |
|----|------|-------------|-------------|--------|-------|--------|------------|
| FR1 | Client non-payment | Hotel delays or defaults on monthly retainer | 4 | 4 | 16 | High | Net-15 terms. Retainer prepayment model for new clients. Late payment penalties (2%/month). Escalation: suspend services at 60 days. |
| FR2 | Currency devaluation | EGP devaluation against USD increases import costs | 4 | 4 | 16 | High | Price in USD-equivalent with EGP conversion at payment date. Maintain USD bank account. Hedge via supplier credit terms. |
| FR3 | Cash flow crunch | Gap between paying suppliers and receiving client payments | 3 | 4 | 12 | Medium | Maintain 3-month operating reserve. Negotiate 30-60 day supplier terms. Invoice on delivery. Line of credit facility. |
| FR4 | Underpricing services | Initial pricing too low to cover costs at scale | 3 | 3 | 9 | Medium | Review margins quarterly. Build escalation clauses into contracts. Model pricing scenarios before quoting. |
| FR5 | Over-reliance on few clients | Single client >30% of revenue creates dependency | 2 | 4 | 8 | Medium | Cap single-client exposure at 25%. Active pipeline management. Diversify client base. |
| FR6 | Insurance cost increase | Liability or professional indemnity insurance becomes prohibitive | 2 | 3 | 6 | Low | Shop market annually. Implement strong safety protocols. Maintain claims-free record. |

---

## Operational Risks

| ID | Risk | Description | Probability | Impact | Score | Rating | Mitigation |
|----|------|-------------|-------------|--------|-------|--------|------------|
| OR1 | Key person dependency | Founder or lead engineer departure disrupts operations | 2 | 5 | 10 | Medium | Cross-train all critical functions. Document processes. Hire second-in-command early. Key-person insurance. |
| OR2 | Staff turnover | Loss of trained technicians and engineers to competitors | 4 | 3 | 12 | Medium | Competitive pay. Career development paths. Quarterly bonuses tied to retention. Positive culture investment. |
| OR3 | Supply chain failure | Key supplier cannot deliver critical items | 3 | 4 | 12 | Medium | Dual-source all critical items. Maintain safety stock. Develop alternative suppliers in Cairo and internationally. |
| OR4 | Service quality failure | Poor work quality damages reputation | 2 | 5 | 10 | Medium | Standard operating procedures. Quality inspections. Client satisfaction surveys. Service level agreements with remedies. |
| OR5 | Delivery delay | Failure to meet committed response times | 3 | 3 | 9 | Medium | Buffer capacity in scheduling. Partner technician network for overflow. Real-time tracking of response times. |
| OR6 | Inventory obsolescence | Stocked parts become obsolete or expire | 2 | 2 | 4 | Low | Just-in-time inventory for slow movers. Stock rotation. Supplier return agreements for obsolete parts. |
| OR7 | Health & safety incident | Workplace accident involving employee or client property | 2 | 4 | 8 | Medium | Comprehensive H&S policy. PPE requirements. Safety training. Insurance coverage. Incident reporting protocol. |

---

## Market Risks

| ID | Risk | Description | Probability | Impact | Score | Rating | Mitigation |
|----|------|-------------|-------------|--------|-------|--------|------------|
| MR1 | Tourism downturn | Geopolitical event, terrorist attack, or pandemic reduces hotel occupancy | 3 | 5 | 15 | High | Variable cost structure. Retainer revenue provides base. Diversify across geographies. Cash reserves for 6-month lean period. |
| MR2 | Competitor price war | Large competitor enters market with below-cost pricing | 2 | 4 | 8 | Medium | Compete on value and service quality, not price. Build switching costs through embedded processes and relationships. |
| MR3 | Slow client adoption | Hotels resistant to outsourcing engineering operations | 4 | 3 | 12 | Medium | Start with low-commitment services (supply only, audits). Build trust before upselling full partnership. Pilot programs. |
| MR4 | Seasonality impact | Low season reduces hotel budgets for engineering spend | 3 | 3 | 9 | Medium | Annual contracts smooth cash flow. Fixed retainer model. Offer seasonal scope adjustments. |
| MR5 | Negative market perception | Reputation damage from one bad client experience spreads | 2 | 4 | 8 | Medium | Over-deliver on first clients. Proactive issue resolution. Client NPS tracking. Relationship management. |

---

## Strategic Risks

| ID | Risk | Description | Probability | Impact | Score | Rating | Mitigation |
|----|------|-------------|-------------|--------|-------|--------|------------|
| SR1 | Wrong market focus | Pursuing wrong hotel segment or geography | 3 | 4 | 12 | Medium | Quarterly strategy review. Test assumptions with pilot clients. Stay lean in year 1 to pivot quickly. |
| SR2 | Scaling too fast | Taking on more clients than delivery capacity allows | 3 | 4 | 12 | Medium | Implement structured hiring plan. Only add clients when team is ready. Use contractor partners for overflow. |
| SR3 | Partner dependency | Over-reliance on a partner who fails or renegotiates | 2 | 3 | 6 | Low | Non-exclusive agreements. Multi-partner strategy. Regular partner performance reviews. |
| SR4 | Technology failure | Digital platform crashes or becomes unavailable | 2 | 3 | 6 | Low | Cloud-based with backup. SLA from tech provider. Offline fallback processes. Regular data backups. |
| SR5 | Regulatory shock | New regulation makes business model unviable | 1 | 5 | 5 | Low | Industry association membership for early warning. Legal counsel. Diversified service portfolio. |

---

## Risk Heat Map

```
Impact →
5 | SR5        | FR1, FR2  | MR1        | OR1, OR4   | SR1, SR2   |
4 | OR6        | FR4, FR5, | FR3, OR2,  | OR5, MR3,  | MR2, OR3,  |
  |            | OR7       | MR4        | MR4        | OR7        |
3 |            | FR6       | FR3, MR4   | OR5, MR4   |            |
2 |            |           |            |            |            |
1 |            |           |            |            |            |
  +------------+-----------+------------+------------+-----------+
       1            2           3            4            5
                                Probability →
```

---

## Top 5 Risks Requiring Immediate Attention

| Rank | ID | Risk | Score | Action |
|------|----|------|-------|--------|
| 1 | FR1 | Client non-payment | 16 | Implement prepayment model. Legal-ready collection process. |
| 2 | FR2 | Currency devaluation | 16 | USD-based pricing. USD bank account. Supplier terms in EGP. |
| 3 | MR1 | Tourism downturn | 15 | 6-month cash reserve. Variable cost structure. Geographic diversification roadmap. |
| 4 | MR3 | Slow client adoption | 12 | Low-commitment entry services. Pilot programs. Case study development. |
| 5 | SR1 | Wrong market focus | 12 | Lean operations. Quarterly strategy pivots. Test before scaling. |

---

## Risk Review Schedule

- **Weekly:** Operational risks (OR1-OR7) in team stand-up
- **Monthly:** Financial and market risks (FR1-FR6, MR1-MR5) in management review
- **Quarterly:** Full risk register review with updated scores
- **Annually:** Strategic risk assessment (SR1-SR5) with board/investors
