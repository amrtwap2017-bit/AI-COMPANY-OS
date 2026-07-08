# 01-COMMERCIAL — AI Opportunities

## V1 Automations (Rule-based)

| Automation | Input | Logic | Output |
|------------|-------|-------|--------|
| Lead scoring | Lead data (source, title, company, phone) | Weighted rules: source(20), title(25), company_size(20), phone_valid(15), industry(20) | Score 0-100 |
| Lead assignment | Score, team capacity | High → senior rep; Medium → round-robin; Low → nurture |
| Duplicate detection | Email, phone | Fuzzy match on existing leads/contacts | Flag for review |
| Quotation margin check | Line items | Warn < 25%, block < 10% | Validation result |
| Pipeline forecast | Opportunities by stage | Weighted value by probability | Forecast report |
| Contract expiry alert | Contract end_date | 30-day and 7-day warnings | Notification |

## V2 AI Opportunities (Post-MVP)

| Opportunity | Model Type | Value |
|-------------|-----------|-------|
| Lead intent prediction | Classification | Prioritize high-intent leads |
| Quotation optimization | Regression | Suggest margin improvements |
| Site survey auto-analysis | Computer Vision | Extract measurements from photos |
| Contract risk scoring | Classification | Flag risky terms/conditions |
| Churn prediction | Classification | Identify at-risk clients |
| Cross-sell recommendations | Recommendation | Suggest services to existing clients |
