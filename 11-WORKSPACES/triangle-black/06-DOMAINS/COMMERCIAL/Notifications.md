# 01-COMMERCIAL — Notifications

## Notification Triggers

| Event | Recipient | Channel | Template |
|-------|-----------|---------|----------|
| Lead assigned | Sales rep | In-app | "New lead: {firstName} {lastName} from {company}" |
| Lead converted | Sales rep | In-app | "Lead {name} converted to opportunity" |
| Survey scheduled | Engineer | In-app, Email | "Site survey scheduled for {date} at {company}" |
| Survey submitted | Manager | In-app | "Survey report ready for review — {company}" |
| Survey approved | Sales rep | In-app | "Survey approved — ready for quotation" |
| Quotation submitted | Manager | In-app | "Quotation {number} ({value}) needs approval" |
| Quotation approved | Sales rep | In-app | "Quotation {number} approved — send to client" |
| Quotation sent | Client | Email | "Your quotation from Triangle Black" |
| Quotation expiring (7d) | Sales rep | In-app, Email | "Quotation {number} expires in 7 days" |
| Quotation expired | Sales rep | In-app | "Quotation {number} has expired" |
| Quotation client approved | Sales rep, Manager | In-app | "Client approved quotation {number}" |
| Contract activated | PM, Sales | In-app | "Contract {number} activated — project created" |
| Contract expiring (30d) | Manager | In-app, Email | "Contract {number} expires in 30 days" |
| Contract terminated | Manager | In-app | "Contract {number} terminated" |
