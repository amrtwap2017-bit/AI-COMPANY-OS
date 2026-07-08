# 13-HUMAN-RESOURCES — Components

## Shared (00-SHARED-KERNEL)

| Component | Used In |
|-----------|---------|
| DataTable | All list screens |
| StatusBadge | Employee, Leave, Timesheet status indicators |
| ActivityTimeline | Employee detail timeline |
| FileUploader | Employee document uploads |
| ConfirmDialog | Approve/reject actions |
| SearchBar | All list screens |
| FilterPanel | All list screens |
| CalendarView | Leave calendar, attendance calendar |
| FormBuilder | Employee create/edit forms |

## Domain-Specific

| Component | Purpose |
|-----------|---------|
| OrgTreeView | Visual department hierarchy with expand/collapse |
| EmployeeCard | Employee summary card for org chart |
| LeaveBalanceGauge | Visual leave balance (used/remaining) |
| TimesheetGrid | Weekly hours grid: projects × days (drag to fill) |
| AttendanceStatus | Live check-in/out indicator |
| TeamCalendar | Team leave overlay on calendar |
| ApprovalQueue | Pending approval items with batch actions |
| CostAllocationBar | Project cost breakdown from timesheets |
| PayslipPDF | PDF preview/download of payslip |
