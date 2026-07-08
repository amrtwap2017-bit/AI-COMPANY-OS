# Dashboard — Widget Patterns

The dashboard is a server-rendered page composed of client component widgets. Each widget fetches its own data via React Query.

## Dashboard Page

`	ypescript
// src/app/(dashboard)/dashboard/page.tsx
export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your property" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsWidget title="Occupancy" metric={76} unit="%" trend="up" />
        <StatsWidget title="Revenue MTD" metric={125000} unit="SAR" trend="up" />
        <StatsWidget title="Check-ins Today" metric={12} unit="" trend="neutral" />
        <StatsWidget title="Pending Tasks" metric={5} unit="" trend="down" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RevenueChart className="lg:col-span-4" />
        <UpcomingArrivals className="lg:col-span-3" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <RecentBookings />
        <AlertsWidget />
      </div>
    </div>
  );
}
`

## Widget Patterns

### Stats Widget (KPI Card)

`	ypescript
interface StatsWidgetProps {
  title: string;
  metric: number;
  unit?: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function StatsWidget({ title, metric, unit, trend, trendValue }: StatsWidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatNumber(metric)}
          {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
        </div>
        {trendValue && (
          <p className={	ext-xs }>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue} from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}
`

### Chart Widget (using Recharts)

`	ypescript
'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RevenueChart({ className }: { className?: string }) {
  const { data } = useRevenueChartData();
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
`

## Dashboard Widgets (V1)

| Widget              | Data Source             | Refetch Interval | Description                      |
| ------------------- | ----------------------- | ---------------- | -------------------------------- |
| StatsCards        | GET /v1/dashboard/stats | 5 min          | 4 KPI cards: occupancy, revenue, arrivals, tasks |
| RevenueChart      | GET /v1/reports/revenue | 15 min         | 30-day revenue line chart        |
| OccupancyChart    | GET /v1/reports/occupancy | 15 min       | 30-day occupancy bar chart       |
| UpcomingArrivals  | GET /v1/bookings/upcoming | 2 min         | Today's and tomorrow's check-ins |
| RecentBookings    | GET /v1/bookings?limit=5 | 30 sec        | Last 5 bookings with status      |
| AlertsWidget      | GET /v1/alerts         | 1 min            | System alerts and notifications  |
| HousekeepingSummary | GET /v1/housekeeping/summary | 2 min     | Room status breakdown            |

## Grid Layout

Dashboard uses CSS Grid with responsive breakpoints:

- **1 col** — mobile (< 768px)
- **2 col** — tablet (768px - 1024px)
- **4 col** — desktop (> 1024px) for stat cards
- **7 col** — for chart + arrivals side by side

Widgets can be rearranged by user preference in a future version (drag-and-drop via @dnd-kit).
