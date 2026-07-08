# 13-HUMAN-RESOURCES — Implementation Checklist

## Backend

- [ ] Department module (model, service, controller, DTOs)
- [ ] Employee module (model, service, controller, DTOs)
- [ ] Leave module (model, service, controller, DTOs, state machine)
- [ ] Timesheet module (model, service, controller, DTOs, state machine)
- [ ] Attendance module (model, service, controller, DTOs)
- [ ] Leave balance calculation service
- [ ] Timesheet cost allocation service
- [ ] Attendance anomaly detection service
- [ ] Payroll computation service (V2)
- [ ] Event handlers (leave.approved → balance update, timesheet.approved → cost allocation)
- [ ] Permission guards for all endpoints
- [ ] File upload service for employee documents

## Frontend

- [ ] Employee list + detail + create + edit screens
- [ ] Department list + detail + create screens
- [ ] Org chart visual component
- [ ] Leave request + approval + calendar screens
- [ ] Timesheet entry grid + approval screens
- [ ] Timesheet report screen
- [ ] Attendance check-in/out (mobile-friendly)
- [ ] Attendance report + anomaly screens
- [ ] Payroll list + detail screens
- [ ] Employee self-service dashboard

## Infrastructure

- [ ] RBAC seed: employee, manager, hr_admin, hr_manager, finance_hr roles
- [ ] Seed data: sample departments, employees, leave policies
- [ ] Timesheet period cron job (weekly opening/closing)
- [ ] Attendance anomaly detection cron job (daily)
