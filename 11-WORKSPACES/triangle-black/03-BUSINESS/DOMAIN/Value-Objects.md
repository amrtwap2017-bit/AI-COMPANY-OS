# Value Objects

Immutable value objects used across the domain, defined by their attributes rather than identity.

---

## Common / Cross-Cutting Value Objects

| Value Object | Attributes | Used In | Notes |
|-------------|-----------|---------|-------|
| Address | Street, City, State, PostalCode, Country | CRM, Procurement, Project | Value equality based on all fields |
| Money | Amount, Currency | Quotation, Contract, Procurement | Immutable, arithmetic operations return new instance |
| Percentage | Value (decimal 0–100) | Quotation, Contract, Project | Validated at construction |
| DateRange | StartDate, EndDate | Project, Contract, Campaign | Invariant: EndDate >= StartDate |
| PhoneNumber | CountryCode, Number, Extension | CRM, Procurement | Format validated at construction |
| EmailAddress | Address | CRM, Administration | Format validated at construction |
| FileRef | FileName, MimeType, StoragePath, Size | Document | Reference to stored file |
| UserRef | UserId, DisplayName | All | Lightweight reference to a system user |
| AuditInfo | CreatedBy, CreatedAt, UpdatedBy, UpdatedAt | All | Captures who and when |

---

## CRM Value Objects

| Value Object | Attributes | Parent Entity | Notes |
|-------------|-----------|--------------|-------|
| LeadSource | SourceType, CampaignName, ReferrerUrl | Lead | Origin of lead capture |
| ContactInfo | Email, Phone, Mobile, PreferredContactMethod | Lead, Contact | Flexible contact details |
| LeadScore | Score, ModelVersion, LastUpdated | Lead | Numerical score with model metadata |
| PipelineStage | Name, Sequence, Probability | Opportunity | Stage in the sales pipeline |
| OpportunityLineItem | ProductCode, Description, Quantity, UnitPrice, Total | Opportunity | Line item details |

---

## Quotation Value Objects

| Value Object | Attributes | Parent Entity | Notes |
|-------------|-----------|--------------|-------|
| Price | UnitPrice, CostPrice, ListPrice, DiscountPercent | QuotationLineItem | Price breakdown |
| TaxInfo | TaxRate, TaxAmount, TaxType | Quotation | Tax calculation details |
| QuoteTerm | Description, Value, IsMandatory | Quotation | Commercial or technical term |
| ValidityPeriod | ValidFrom, ValidTo, DurationDays | Quotation | Length of quotation validity |

---

## Contract Value Objects

| Value Object | Attributes | Parent Entity | Notes |
|-------------|-----------|--------------|-------|
| CommercialTerm | PaymentTerms, WarrantyPeriod, PenaltyClause | Contract | Financial/legal terms |
| PaymentSchedule | MilestoneName, Amount, DueDate, Percentage | Contract | Structured payment plan |
| SignatureInfo | SignedBy, SignedRole, Date, IPAddress | Signature | Evidence of signing |
| ContractTerminationReason | ReasonCode, Description, EffectiveDate | Contract | Reason for termination |

---

## Project Value Objects

| Value Object | Attributes | Parent Entity | Notes |
|-------------|-----------|--------------|-------|
| Effort | Hours, Unit (hour/day/week) | Task | Time estimate or actual |
| ResourceAllocation | ResourceId, Role, Percentage, DateRange | ResourceAssignment | Allocation details |
| IssuePriority | Level (Critical/High/Medium/Low), Score | Issue | Priority classification |
| RiskImpact | Probability, ImpactLevel, ImpactAmount, Score | Risk | Quantitative impact assessment |
| ChangeImpact | BudgetChange, ScheduleChange (days), ScopeChange | ChangeOrder | Quantified impact of change |
| ConditionGrade | Grade (A/B/C/D/F), Description | ConditionReport | Asset condition rating |

---

## Procurement Value Objects

| Value Object | Attributes | Parent Entity | Notes |
|-------------|-----------|--------------|-------|
| VendorCategory | CategoryCode, CategoryName, CertificationLevel | Vendor | Vendor specialization area |
| EvaluationScore | CriteriaName, Weight, Score, WeightedScore | VendorResponse | Scoring details |
| DeliveryTerm | Incoterm, DeliveryLocation, ExpectedDate, ActualDate | PurchaseOrder | Delivery specifications |
| PaymentTermType | Type (Net30/Net60/etc.), Discount%, DiscountDays | PurchaseOrder | Payment timing and discounts |

---

## Inventory Value Objects

| Value Object | Attributes | Parent Entity | Notes |
|-------------|-----------|--------------|-------|
| LocationRef | WarehouseCode, Aisle, Rack, Bin | StockLevel | Physical location identifier |
| BatchInfo | BatchNumber, ManufactureDate, ExpiryDate | StockLevel | Batch and expiry tracking |
| StockQuantity | Quantity, UnitOfMeasure | StockLevel, StockMovement | Quantity with units |

---

## Notification Value Objects

| Value Object | Attributes | Parent Entity | Notes |
|-------------|-----------|--------------|-------|
| NotificationContent | Subject, Body, Priority | Notification | Rendered content of a notification |
| DeliveryChannel | Channel (Email/SMS/Push/InApp), RecipientAddress | Notification | How and where to deliver |

---

## Administration Value Objects

| Value Object | Attributes | Parent Entity | Notes |
|-------------|-----------|--------------|-------|
| PermissionScope | Resource, Action, Constraints | Permission | Defines what and how |
| ConfigValue | Key, Value, DataType, Category | SystemConfiguration | Key-value with metadata |
