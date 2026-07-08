# Security Tasks

## Overview

Security tasks ensure that the application, infrastructure, and development practices meet security standards and comply with organizational security policies. These tasks are integrated throughout the development lifecycle rather than treated as a final gate.

---

## 1. Perform Security Review

Conduct a systematic review of application code, architecture, or configuration for security vulnerabilities.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Identify security weaknesses before they can be exploited in production. |
| **Inputs**      | Source code changes, architecture diagrams, data flow diagrams, threat model, security requirements, compliance standards (OWASP, CIS, SOC 2, PCI-DSS). |
| **Outputs**     | Security review report, finding descriptions with severity ratings (Critical, High, Medium, Low), remediation recommendations, risk acceptance documentation (if applicable). |
| **Quality Gates**| No Critical findings remain open, all High findings have documented remediation plans, review covers OWASP Top 10 categories, findings are reproducible with documented steps, review is completed before code is merged to main. |
| **Effort Range**| 2–4 hours per feature or component. |

---

## 2. Validate Authentication

Verify that authentication mechanisms are correctly implemented and secure.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Ensure that users and services are properly identified before accessing the system. |
| **Inputs**      | Authentication implementation code, authentication configuration, identity provider integration details, token management specifications (JWT, OAuth, SAML). |
| **Outputs**     | Authentication validation report, test results for each authentication path, token handling verification, session management assessment, vulnerability findings. |
| **Quality Gates**| All authentication paths enforce proper validation, tokens expire correctly and are validated on each request, session management prevents fixation/hijacking, MFA is enforced where required, authentication failures are logged. |
| **Effort Range**| 2–4 hours per authentication mechanism. |

---

## 3. Verify Authorization

Confirm that access control rules are correctly implemented and enforced.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Ensure that authenticated users can only access resources and perform actions they are explicitly permitted to. |
| **Inputs**      | Authorization implementation (RBAC, ABAC, ACL), permission model definition, role definitions, access control policies, test cases for each permission level. |
| **Outputs**     | Authorization test results, permission matrix verification, privilege escalation test results, authorization bypass test results, findings and remediation. |
| **Quality Gates**| All endpoints enforce authorization checks, users cannot access resources above their permission level, horizontal privilege escalation is prevented, permission changes take effect within defined SLA, authorization failures return 403 with no information leakage. |
| **Effort Range**| 2–4 hours per authorization domain. |

---

## 4. Check Input Sanitization

Review and test input validation and sanitization across all entry points.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Prevent injection attacks (SQL, NoSQL, command, LDAP, XSS) by ensuring all user-supplied input is properly validated and sanitized. |
| **Inputs**      | API endpoint specifications, form definitions, data ingestion pipelines, input validation code, existing sanitization libraries. |
| **Outputs**     | Input sanitization audit report, injection test results, vulnerability findings, field-level validation gaps, remediation recommendations. |
| **Quality Gates**| All input fields are validated on both client and server, parameterized queries are used for all database operations, output encoding is applied for all user-supplied content rendered in HTML/XML, file uploads are validated for type and size, injection probes return errors (not data leakage). |
| **Effort Range**| 2–3 hours per application or service. |

---

## 5. Review Dependency Vulnerabilities

Analyze third-party dependencies for known security vulnerabilities.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Identify and remediate security risks introduced by open-source and third-party libraries. |
| **Inputs**      | Dependency manifests (package.json, requirements.txt, pom.xml, go.mod), lock files, vulnerability database feeds (NVD, GHSA, Snyk, Dependabot), license compliance requirements. |
| **Outputs**     | Dependency vulnerability scan report, severity-graded findings, remediation recommendations (upgrade, patch, replace), license compliance assessment, vulnerability tracking entries. |
| **Quality Gates**| No Critical or High severity vulnerabilities with known exploits, all vulnerabilities have documented remediation plans, dependencies are within license compliance, automated scanning is integrated into CI, scan runs on every build. |
| **Effort Range**| 1–2 hours per scan cycle. |

---

## 6. Validate Data Encryption

Verify that sensitive data is encrypted at rest and in transit according to policy.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Ensure that sensitive data is protected from unauthorized access through encryption. |
| **Inputs**      | Data classification policy, encryption standards (AES-256, TLS 1.3), data flow diagrams showing sensitive data paths, encryption implementation code, key management specifications. |
| **Outputs**     | Encryption validation report, TLS configuration assessment, at-rest encryption verification, key management review, certificate management assessment. |
| **Quality Gates**| All traffic uses TLS 1.2 or higher, certificates are valid and not expired, sensitive data in databases is encrypted at rest, encryption keys are managed via a key management system (not hard-coded), backups are encrypted. |
| **Effort Range**| 2–3 hours per application or service. |

---

## 7. Review Audit Logging

Verify that security-relevant events are properly logged and auditable.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Ensure that the system maintains a complete, tamper-evident audit trail for security and compliance purposes. |
| **Inputs**      | Audit logging requirements, compliance standards (SOC 2, HIPAA, PCI-DSS), logging implementation, log retention configuration, log monitoring setup. |
| **Outputs**     | Audit logging review report, log coverage assessment, log integrity verification, log monitoring configuration review, compliance gap analysis. |
| **Quality Gates**| All security events (authentication, authorization changes, data access, configuration changes) are logged, logs include timestamps, user IDs, correlation IDs, and action details, logs cannot be modified or deleted by non-admin users, log retention period meets compliance requirements, logs are shipped to a centralized logging system. |
| **Effort Range**| 1–3 hours per application. |

---

## 8. Perform Threat Modeling

Systematically identify and evaluate potential threats to the application or feature.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Proactively identify security threats and design mitigations before implementation. |
| **Inputs**      | Architecture diagrams, data flow diagrams, trust boundaries, asset inventory, compliance requirements, threat library (STRIDE, PASTA). |
| **Outputs**     | Threat model document, data flow diagrams with threat annotations, threat list with risk ratings (DREAD), mitigation strategies, residual risk acceptance. |
| **Quality Gates**| All identified threats have documented mitigations or risk acceptance, threat model is reviewed by security team, threat model is updated when architecture changes, high-risk threats have concrete mitigation plans. |
| **Effort Range**| 3–6 hours per feature or system component. |
