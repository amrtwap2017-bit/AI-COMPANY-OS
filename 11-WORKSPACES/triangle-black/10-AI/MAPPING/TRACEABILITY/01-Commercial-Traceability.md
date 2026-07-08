# Commercial Traceability

## Lead Management
**Chain:** Lead Management → Lead Capture & Qualification → NewLeadForm, LeadList, LeadDetail → POST /leads, GET /leads, GET /leads/:id, PUT /leads/:id → Lead, LeadSource, LeadActivity → AutoScoreRule, DuplicateDetectionRule, LeadAssignmentRule → Leads.Create, Leads.View, Leads.Edit, Leads.Delete, Leads.Assign → LeadAssignedNotification, LeadScoreAlert → LeadConversionReport, LeadSourceAnalysis → SalesDashboard → LeadScoringAI
**Status:** ✅ Full Trace

## Opportunity Management
**Chain:** Opportunity Management → Opportunity Tracking & Pipeline → OpportunityForm, OpportunityList, PipelineView, StageProgress → POST /opportunities, GET /opportunities, GET /opportunities/:id, PUT /opportunities/:id, PATCH /opportunities/:id/stage → Opportunity, OpportunityLineItem, OpportunityStage, OpportunityHistory → StageTransitionRule, ProbabilityRule, WinLossRule, OpportunityCloseRule → Opportunities.Create, Opportunities.View, Opportunities.Edit, Opportunities.Delete, Opportunities.StageChange → StageChangedNotification, OpportunityAssignedNotification → PipelineForecastReport, WinLossAnalysis, OpportunityAgingReport → SalesDashboard → OpportunityScoringAI, StagePredictionAI
**Status:** ✅ Full Trace

## Survey Management
**Chain:** Survey Management → Survey Creation & Response Collection → SurveyBuilder, SurveyList, SurveyResponseForm, SurveyAnalytics → POST /surveys, GET /surveys, GET /surveys/:id, PUT /surveys/:id, POST /surveys/:id/responses, GET /surveys/:id/responses → Survey, SurveyQuestion, SurveyResponse, SurveyAnswer → SurveyPublishingRule, ResponseValidationRule, SurveyExpiryRule → Surveys.Create, Surveys.View, Surveys.Edit, Surveys.Delete, Surveys.Respond → SurveyPublishedNotification, ResponseReceivedNotification → SurveySummaryReport, ResponseAnalyticsReport → CustomerIntelligenceDashboard → SurveySentimentAI
**Status:** ✅ Full Trace

## Quotation Management
**Chain:** Quotation Management → Quote Generation & Approval → QuoteForm, QuoteList, QuoteDetail, QuoteComparisonView, QuoteApprovalWorkflow → POST /quotations, GET /quotations, GET /quotations/:id, PUT /quotations/:id, POST /quotations/:id/approve, POST /quotations/:id/send → Quotation, QuotationLineItem, QuotationTerm, QuotationRevision, QuotationApproval → DiscountApprovalRule, QuoteExpiryRule, MarginCheckRule, RevisionTrackingRule → Quotations.Create, Quotations.View, Quotations.Edit, Quotations.Delete, Quotations.Approve, Quotations.Send → QuoteExpiryNotification, QuoteApprovalRequestNotification, QuoteApprovedNotification, QuoteRejectedNotification → QuoteConversionReport, QuoteMarginAnalysis, QuoteAgingReport → SalesDashboard → QuoteOptimizationAI, SmartPricingAI
**Status:** ✅ Full Trace

## Contract Management
**Chain:** Contract Management → Contract Lifecycle & Compliance → ContractForm, ContractList, ContractDetail, ContractClauseLibrary, ContractRenewalWorkflow → POST /contracts, GET /contracts, GET /contracts/:id, PUT /contracts/:id, POST /contracts/:id/approve, POST /contracts/:id/renew, POST /contracts/:id/amend → Contract, ContractClause, ContractParty, ContractAmendment, ContractMilestone, ContractObligation → AutoRenewalRule, ContractExpiryRule, ObligationTrackingRule, AmendmentVersionRule → Contracts.Create, Contracts.View, Contracts.Edit, Contracts.Delete, Contracts.Approve, Contracts.Renew → ContractExpiryNotification, ContractApprovalRequestNotification, RenewalReminderNotification, ObligationDueNotification → ContractExpiryReport, ObligationComplianceReport, ContractValueReport → ExecutiveDashboard → ContractRiskAI, ClauseRecommendationAI
**Status:** ✅ Full Trace

## Customer Portal
**Chain:** Customer Portal → Self-Service & Communication → PortalDashboard, PortalProjects, PortalDocuments, PortalInvoices, PortalTickets, PortalProfile → GET /portal/dashboard, GET /portal/projects, GET /portal/documents, GET /portal/invoices, POST /portal/tickets, PUT /portal/profile → PortalUser, PortalSession, PortalTicket, PortalDocument, PortalNotification → PortalAccessRule, PortalDataVisibilityRule, TicketPriorityRule → Portal.Access, Portal.ViewProjects, Portal.ViewDocuments, Portal.ViewInvoices, Portal.CreateTickets, Portal.EditProfile → NewTicketNotification, DocumentUploadedNotification, InvoiceReadyNotification → PortalUsageReport, PortalTicketAnalytics → CustomerSatisfactionDashboard → PortalChatbotAI, TicketRoutingAI
**Status:** ✅ Full Trace

## Customer Management
**Chain:** Customer Management → Customer 360 & Segmentation → CustomerForm, CustomerList, CustomerDetail, Customer360View, CustomerSegmentView → POST /customers, GET /customers, GET /customers/:id, PUT /customers/:id, POST /customers/:id/merge, GET /customers/:id/activity → Customer, CustomerContact, CustomerAddress, CustomerSegment, CustomerActivity, CustomerNote → CustomerMergeRule, SegmentationRule, CustomerStatusRule, DuplicateDetectionRule → Customers.Create, Customers.View, Customers.Edit, Customers.Delete, Customers.Merge → CustomerBirthdayNotification, CustomerStatusChangeNotification → CustomerValueReport, CustomerSegmentationReport, CustomerActivityReport → CustomerIntelligenceDashboard → CustomerChurnPredictionAI, CustomerValuePredictionAI
**Status:** ✅ Full Trace

## Communication Management
**Chain:** Communication Management → Multi-Channel Communication & Tracking → EmailComposer, EmailLog, CallLogView, CommunicationTimeline, TemplateLibrary → POST /communications, GET /communications, GET /communications/:id, POST /communications/:id/template, GET /communications/templates → Communication, CommunicationTemplate, CommunicationAttachment, CommunicationThread → TemplateAssignmentRule, CommunicationLoggingRule, AutoResponseRule → Communications.Create, Communications.View, Communications.Edit, Communications.Delete → EmailReceivedNotification, CallScheduledNotification → CommunicationActivityReport, TemplateUsageReport → SalesDashboard → SmartReplyAI, EmailSentimentAI
**Status:** ✅ Full Trace
