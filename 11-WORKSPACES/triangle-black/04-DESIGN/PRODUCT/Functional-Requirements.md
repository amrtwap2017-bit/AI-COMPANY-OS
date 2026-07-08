---
ID: 07-Product-09
Title: Functional Requirements
Purpose: Define all functional requirements for V1 organized by module
Version: 1.0
Status: Draft
Last Updated: 2026-06-30
---

# Functional Requirements — V1

## 1. Public Website

| ID | Requirement | Priority |
|----|-------------|----------|
| WEB-01 | Site must display company information, services, and value proposition | P0 |
| WEB-02 | Contact form must capture name, email, phone, company, message | P0 |
| WEB-03 | Contact form submissions must create a Lead in CRM automatically | P0 |
| WEB-04 | Site must be responsive (desktop, tablet, mobile) | P0 |
| WEB-05 | Site must load in under 3 seconds on standard connections | P0 |
| WEB-06 | Services page must list all service categories with descriptions | P0 |
| WEB-07 | About page must include company background and team | P1 |
| WEB-08 | Case studies section must display at least 2 placeholder entries | P1 |
| WEB-09 | Blog section must support posts with markdown content | P2 |
| WEB-10 | Site must have a privacy policy and terms of service pages | P0 |
| WEB-11 | All external links must open in new tabs with rel="noopener" | P0 |
| WEB-12 | Contact form must have CAPTCHA or honeypot spam protection | P0 |

## 2. CRM

| ID | Requirement | Priority |
|----|-------------|----------|
| CRM-01 | System must support Lead creation (manual + automatic from website) | P0 |
| CRM-02 | Lead record must include: name, email, phone, company, source, status, notes | P0 |
| CRM-03 | Lead statuses must include: New, Contacted, Qualified, Disqualified, Converted | P0 |
| CRM-04 | System must support converting a Lead to an Opportunity linked to Company/Contact | P0 |
| CRM-05 | Opportunity must include: name, value, stage, probability, close date, owner | P0 |
| CRM-06 | Opportunity stages must include: Qualification, Needs Analysis, Proposal, Negotiation, Closed Won, Closed Lost | P0 |
| CRM-07 | Company record must include: name, industry, size, address, phone, website, notes | P0 |
| CRM-08 | Contact record must include: name, email, phone, job title, department, company link | P0 |
| CRM-09 | System must log activities (call, email, meeting, note) on Leads, Opportunities, Companies, Contacts | P0 |
| CRM-10 | Activities must include: type, date, subject, description, created by, linked entity | P0 |
| CRM-11 | System must support search across all CRM entities | P0 |
| CRM-12 | Pipeline view must show opportunities by stage with total value | P0 |
| CRM-13 | Users must be able to filter opportunities by owner, stage, date range | P1 |
| CRM-14 | System must prevent duplicate Company records (name matching) | P1 |
| CRM-15 | Each record must show creation and last-updated timestamps with user | P0 |

## 3. Quotations

| ID | Requirement | Priority |
|----|-------------|----------|
| QTN-01 | System must support RFQ creation with line items, specifications, and requested delivery date | P0 |
| QTN-02 | RFQ statuses: Draft, Submitted, Under Review, Approved, Rejected | P0 |
| QTN-03 | System must generate Quotation from RFQ (copy line items, add pricing) | P0 |
| QTN-04 | Quotation must include: number (auto-generated), date, valid until, line items, subtotal, tax, total | P0 |
| QTN-05 | Quotation statuses: Draft, Sent, Under Review, Approved, Rejected, Expired | P0 |
| QTN-06 | System must track quotation version history (revisions) | P0 |
| QTN-07 | System must generate Contract from approved Quotation | P0 |
| QTN-08 | Contract must include: number, parties, scope, value, terms, signatures | P0 |
| QTN-09 | Contract statuses: Draft, Sent, Signed, Active, Completed, Terminated | P0 |
| QTN-10 | System must support digital signature capture (basic: name + date) | P1 |
| QTN-11 | All documents must be exportable as PDF | P0 |
| QTN-12 | System must send notifications on status changes (RFQ, Quotation, Contract) | P0 |
| QTN-13 | Quotations must support currency setting (EGP default, USD option) | P1 |
| QTN-14 | Line items must support: description, quantity, unit, unit price, discount, total | P0 |

## 4. Projects

| ID | Requirement | Priority |
|----|-------------|----------|
| PRJ-01 | System must support Project creation with name, description, dates, status, value | P0 |
| PRJ-02 | Project statuses: Planning, In Progress, On Hold, Completed, Cancelled | P0 |
| PRJ-03 | Projects must support Milestones with name, due date, status, assignee | P0 |
| PRJ-04 | Milestone statuses: Not Started, In Progress, Completed, Approved | P0 |
| PRJ-05 | System must support file uploads at Project and Milestone level | P0 |
| PRJ-06 | Supported file types: PDF, DOCX, XLSX, JPG, PNG, DWG | P0 |
| PRJ-07 | Files must have: name, description, category, upload date, uploaded by | P0 |
| PRJ-08 | Projects must be linkable to a Contract | P0 |
| PRJ-09 | Projects must be linkable to a Client (Company) | P0 |
| PRJ-10 | System must display project timeline with milestone dates | P1 |
| PRJ-11 | System must calculate project completion % based on milestones | P0 |
| PRJ-12 | Project notes/activity log must track all changes and comments | P1 |

## 5. Client Portal

| ID | Requirement | Priority |
|----|-------------|----------|
| POR-01 | Portal must require authentication (email/password or magic link) | P0 |
| POR-02 | Dashboard must show active projects, pending quotations, recent documents | P0 |
| POR-03 | User must see only data for their client company (multi-tenant isolation) | P0 |
| POR-04 | Project view must show milestones, status, files, and timeline | P0 |
| POR-05 | Quotation view must show history, details, and PDF download | P0 |
| POR-06 | User must be able to approve or reject quotations in portal | P0 |
| POR-07 | Document repository must organize files by project and category | P0 |
| POR-08 | Users must be able to search and filter documents | P1 |
| POR-09 | Portal must support service request submission (type, description, priority) | P0 |
| POR-10 | Request types: Maintenance, Procurement, General Inquiry, Emergency | P0 |
| POR-11 | Notification preferences must be configurable (email frequency, types) | P1 |
| POR-12 | Portal must display Triangle Black brand with client branding overlay | P0 |
| POR-13 | Password reset flow must be self-service via email | P0 |
| POR-14 | Session timeout must occur after 60 minutes of inactivity | P0 |

## 6. Executive Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| DSH-01 | Dashboard must display pipeline summary (opportunities count, total value) | P0 |
| DSH-02 | Dashboard must display active project count with status breakdown | P0 |
| DSH-03 | Dashboard must display revenue YTD with monthly trend | P0 |
| DSH-04 | Dashboard must display upcoming milestones (next 14/30 days) | P0 |
| DSH-05 | Dashboard must display client KPIs (quotations pending, active requests) | P1 |
| DSH-06 | Dashboard must support date range filtering | P1 |
| DSH-07 | Charts must be interactive (hover for details, click to drill-down) | P1 |
| DSH-08 | Dashboard must be exportable as PDF | P1 |
| DSH-09 | Dashboard must load in under 3 seconds | P0 |
| DSH-10 | Dashboard data must refresh on page load (not real-time) | P1 |

## 7. Administration

| ID | Requirement | Priority |
|----|-------------|----------|
| ADM-01 | System must support User CRUD with name, email, password, role, status | P0 |
| ADM-02 | Roles must include: Admin (internal), Manager (internal), Client Admin, Client User | P0 |
| ADM-03 | Role-based access must control module visibility and actions | P0 |
| ADM-04 | Users must be assignable to a specific Company (client tenant) | P0 |
| ADM-05 | System must support Company profile configuration (name, logo, address, settings) | P0 |
| ADM-06 | System must maintain an audit log of all create, update, delete actions | P0 |
| ADM-07 | Audit log must include: timestamp, user, action, entity, entity ID, changed fields | P0 |
| ADM-08 | Admin must be able to deactivate/reactivate user accounts | P0 |
| ADM-09 | Password policy must enforce minimum 8 characters, complexity rules | P0 |
| ADM-10 | System settings must include: default currency, tax rate, date format, timezone | P0 |
| ADM-11 | System must support environment-based configuration (dev, staging, production) | P0 |
