1. Schedule page:
   - Query 1: SELECT title, next_due_date FROM maintenance_plans WHERE status = 'active' ORDER BY next_due_date ASC LIMIT 30;
   - Query 2: SELECT title, frequency FROM maintenance_plans GROUP BY frequency ORDER BY COUNT(*) DESC LIMIT 3;
   - Query 3: SELECT title, plan_type FROM maintenance_plans WHERE next_due_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY) ORDER BY next_due_date ASC;

2. Intelligence page:
   - Insight 1: Predictive Maintenance Schedule: Identify assets with upcoming maintenance based on historical frequency.
   - Insight 2: Asset Health Score: Calculate a health score for each asset based on the number and severity of work orders.
   - Insight 3: Maintenance Cost Trends: Analyze trends in maintenance costs over time.

3. Cost review:
   - KPI 1: Average Maintenance Cost per Asset
   - KPI 2: Total Maintenance Costs by Month
   - KPI 3: Cost Efficiency Ratio (Cost per Work Order)

4. Downtime calculation:
   - Calculate downtime for each asset using the formula: SUM(completed_at - started_at) where work_order.status = 'completed'.

5. Schedule page to build first.
