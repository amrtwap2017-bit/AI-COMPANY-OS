1. **SQL for monthly revenue trend (last 6 months from invoices):**

```sql
SELECT 
    DATE_TRUNC('month', invoice_date) AS month,
    SUM(total_amount) AS total_revenue
FROM 
    invoices
WHERE 
    invoice_date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY 
    month
ORDER BY 
    month;
```

**Chart Type:** Line Chart

2. **SQL for lead funnel counts by status:**

```sql
SELECT 
    status,
    COUNT(*) AS count
FROM 
    leads
WHERE 
    status IN ('new', 'qualified', 'negotiation', 'won', 'lost')
GROUP BY 
    status;
```

**Chart Type:** Pie Chart

3. **MTBF formula using work_orders started_at and completed_at:**

```sql
SELECT 
    AVG(completed_at - started_at) AS MTBF
FROM 
    work_orders;
```

**Note:** Ensure that `started_at` and `completed_at` are of a date/time type.

4. **Technician utilization SQL:**

```sql
WITH technician_work AS (
    SELECT 
        technician_id,
        COUNT(*) AS total_work_orders,
        MAX(completed_at) - MIN(started_at) AS total_hours_worked
    FROM 
        work_orders
    GROUP BY 
        technician_id
)
SELECT 
    t.technician_id,
    t.name,
    COALESCE(tw.total_work_orders, 0) AS total_work_orders,
    COALESCE(tw.total_hours_worked, INTERVAL '0') AS total_hours_worked,
    CASE 
        WHEN tw.total_hours_worked = INTERVAL '0' THEN NULL
        ELSE (tw.total_work_orders::decimal / EXTRACT(EPOCH FROM tw.total_hours_worked) * 8) * 60
    END AS utilization_percentage
FROM 
    technicians t
LEFT JOIN 
    technician_work tw ON t.technician_id = tw.technician_id;
```

**Chart Type:** Bar Chart

5. **Which chart type for each (bar/line/pie/gauge):**

- Revenue trend chart: Line Chart
- Lead funnel by stage: Pie Chart
- Asset reliability (MTBF from work_orders): Gauge Chart
- Technician utilization: Bar Chart
