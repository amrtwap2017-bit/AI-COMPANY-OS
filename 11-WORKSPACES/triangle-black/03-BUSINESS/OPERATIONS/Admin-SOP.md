# Admin SOP — Standard Operating Procedure

## Purpose
Define administrative processes for user management, system configuration, role-based access control, and audit compliance across the Triangle Black platform.

## Scope
All platform administrators, system managers, and users requiring system access.

## Actors
- System Administrator — platform configuration and user management
- Department Head — role assignment approval
- Compliance Officer — audit review and access governance
- User — platform user requiring access

## Process Flow

### 1. User Onboarding
| Step | Action | Owner |
|------|--------|-------|
| 1.1 | Hiring manager submits access request form | Department Head |
| 1.2 | Request includes: user details, department, role template, start date | Department Head |
| 1.3 | System Administrator creates user account in platform | System Admin |
| 1.4 | Role assigned based on role template | System Admin |
| 1.5 | Welcome email sent with login credentials and setup guide | Platform |
| 1.6 | User completes first-time login and password change | User |
| 1.7 | Mandatory platform training completed within 5 business days | User |
| 1.8 | Account activated — full access granted | System Admin |

### 2. Role Assignment
| Role Type | Example Roles | Access Scope |
|-----------|---------------|-------------|
| Hotel Client | GM, Engineering Director, Procurement Manager | Client portal — read + request submission |
| Triangle Black Internal | Engineer, Coordinator, Project Manager | Operational modules per department |
| Triangle Black Management | Director, Finance Controller | Dashboard + admin + approve |
| Supplier | Supplier contact | Supplier portal — quotes, POs, deliveries |
| System | Administrator, Auditor | Full system access (admin only) |

| Step | Action | Owner |
|------|--------|-------|
| 2.1 | Role templates defined per role type | System Admin |
| 2.2 | Role assignment approved by Department Head | Department Head |
| 2.3 | Permissions granted per role template | System Admin |
| 2.4 | Quarterly role audit — verify every user still needs their access | Compliance Officer |

### 3. System Configuration
| Step | Action | Owner |
|------|--------|-------|
| 3.1 | Property setup: name, address, room count, brand, chain | System Admin |
| 3.2 | Department hierarchy configured per property | System Admin |
| 3.3 | Approval thresholds configured per client contract | System Admin |
| 3.4 | Notification rules configured per property preferences | System Admin |
| 3.5 | SLA definitions configured per service tier | System Admin |
| 3.6 | Localization settings (language, currency, date format) | System Admin |
| 3.7 | Integration settings (PMS, accounting if applicable) | System Admin |

### 4. User Offboarding
| Step | Action | Owner |
|------|--------|-------|
| 4.1 | Department Head notifies System Admin of departure | Department Head |
| 4.2 | Account deactivated within 2 hours of notification | System Admin |
| 4.3 | Open work orders reassigned | System Admin |
| 4.4 | Data export provided to user (if required by policy) | System Admin |
| 4.5 | Account deletion after 90-day retention period | System Admin |

### 5. Audit Reviews
| Review Type | Frequency | Scope | Owner |
|-------------|-----------|-------|-------|
| Access Audit | Quarterly | All user accounts, roles, last login, inactive accounts | Compliance Officer |
| Configuration Audit | Quarterly | System settings, approval thresholds, SLA config | Compliance Officer |
| Activity Audit | Monthly | Suspicious activity, failed logins, permission changes | Compliance Officer |
| Full Compliance Audit | Annually | All of the above + policy compliance | External Auditor |

## Business Rules
- No shared accounts — every user must have a unique login
- Inactive accounts (no login for 90 days) automatically suspended
- Role changes require approval from both current and new department heads
- All access changes logged in immutable audit trail
- Password policy: minimum 12 characters, MFA required for all users
- Administrator accounts limited to 3 named individuals

## Inputs / Outputs
| Inputs | Outputs |
|--------|---------|
| Access request form | Active user account |
| Role template definition | Configured roles and permissions |
| Employee departure notice | Deactivated account |
| Audit schedule | Audit report with findings |

## KPIs
| KPI | Target | Frequency |
|-----|--------|-----------|
| User onboarding time | < 2 business days | Monthly |
| User offboarding time | < 2 hours | Monthly |
| Inactive account detection | < 24 hours | Monthly |
| Audit compliance rate | 100% | Quarterly |
| Policy violations | 0 | Monthly |

## Exceptions
- Emergency access: Temporary elevated access granted for up to 24 hours with manager approval
- Contractor access: Time-limited accounts with automatic expiry on contract end date
- API access: Service accounts managed through API key process, not user roles
