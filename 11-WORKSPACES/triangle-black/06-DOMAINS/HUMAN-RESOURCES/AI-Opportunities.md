# 13-HUMAN-RESOURCES — AI Opportunities

## V1 Automations (Rule-based)

| Automation | Input | Logic | Output |
|------------|-------|-------|--------|
| Leave balance calculation | Employee, leave type, year | Total - Used + Carryover | Remaining balance |
| Timesheet hour validation | Day hours, shift schedule | Warn if > 12h/day, block > 14h/day | Validation result |
| Attendance anomaly flag | Check-in/out times, schedule | Late > 15min, early > 30min, missing | Anomaly flag |
| Overtime calculation | Hours > 8/day or > 48/week | Rate × 1.5 (normal OT) | Overtime pay |
| Leave accrual | Employee tenure, leave type | Pro-rata for mid-year hires | Accrual amount |
| Payroll computation | Salary + OT + allowances - deductions | Gross - tax - insurance | Net pay |

## V2 AI Opportunities (Post-MVP)

| Opportunity | Model Type | Value |
|-------------|-----------|-------|
| Timesheet auto-suggestion | Regression | Predict hours per project from schedule |
| Attendance pattern analysis | Anomaly Detection | Flag suspicious attendance patterns |
| Employee churn prediction | Classification | Identify at-risk employees |
| Resource allocation optimization | Optimization | Recommend optimal project staffing |
| Leave demand forecasting | Time Series | Predict peak leave periods |
| Performance insights | NLP | Extract insights from manager feedback |
| Cost optimization | Regression | Recommend optimal staffing mix |
