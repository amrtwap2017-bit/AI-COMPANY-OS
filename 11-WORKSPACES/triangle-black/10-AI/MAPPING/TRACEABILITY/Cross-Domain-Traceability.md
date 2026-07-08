# Cross-Domain Traceability

## Contract to Project Activation
**Chain:** Contract → ProjectCreation → NewProjectFromContract, ContractProjectMappingView, BudgetAllocationForm → POST /contracts/:id/create-project, GET /contracts/:id/projects, POST /projects/from-contract → Contract, Project, Budget → ContractActivationRule, ProjectAutoCreationRule, BudgetTransferRule → Contracts.CreateProject, Projects.ViewLinkedContract → ProjectCreatedFromContractNotification, BudgetAllocatedNotification → ContractVsProjectReport → ExecutiveDashboard → ContractProjectionAI
**Status:** ✅ Full Trace

## Timesheet to Cost Allocation
**Chain:** Timesheet → CostAllocation → TimesheetIntegrationView, CostAllocationDashboard, BillingRateForm → POST /timesheets/:id/allocate-cost, GET /costs/by-timesheet, POST /timesheets/billing-rates → Timesheet, CostAllocation, ProjectBudget → TimesheetCostAllocationRule, BillingRateRule, OvertimeCostMultiplierRule → Timesheets.CostAllocate, CostAllocation.View → CostAllocationCompletedNotification → TimesheetCostReport, LaborCostByProjectReport → FinancialDashboard, ProjectDashboard → TimesheetCostPredictionAI
**Status:** ✅ Full Trace

## Purchase Order to Budget Consumption
**Chain:** PurchaseOrder → BudgetConsumption → POBudgetImpactView, BudgetReservationForm, CommitmentTrackingView → POST /purchase-orders/:id/reserve-budget, GET /budget/commitments, POST /budgets/:id/adjust → PurchaseOrder, Budget, Commitment → BudgetReservationRule, CommitmentTrackingRule, BudgetReleaseRule → PurchaseOrders.ReserveBudget, Budgets.ViewCommitments → BudgetReservedNotification, BudgetExceededAlertNotification → BudgetConsumptionReport, CommitmentAgingReport → FinancialDashboard, ProcurementDashboard → BudgetForecastImpactAI
**Status:** ✅ Full Trace

## Goods Receipt to Inventory & AP
**Chain:** GoodsReceipt → InventoryUpdate + APAccrual → ReceiptToInventoryView, APAccrualForm, ThreeWayMatchStatusView → POST /goods-receipts/:id/update-inventory, POST /goods-receipts/:id/accrue-ap, GET /matching/status/:poId → GoodsReceipt, StockItem, Bill → ReceiptToInventoryRule, APAccrualRule, ThreeWayMatchTriggerRule → GoodsReceipts.UpdateInventory, GoodsReceipts.AccrueAP, AP.MatchReceipt → InventoryUpdatedNotification, APAccruedNotification, MatchRequiredNotification → ReceiptToInventoryReport, AccrualAccuracyReport → InventoryDashboard, FinancialDashboard → AccrualAccuracyAI
**Status:** ✅ Full Trace

## Invoice to Revenue Recognition
**Chain:** Invoice → RevenueRecognition → InvoiceToRevenueView, DeferredRevenueScheduleForm, RevenueRecognitionRuleConfig → POST /ar/invoices/:id/recognize-revenue, GET /revenue/by-invoice, POST /revenue/rules/apply → Invoice, RevenueSchedule, DeferredRevenue → RevenueRecognitionTriggerRule, DeferredRevenueRule, ContraRevenueRule → AR.Invoices.RecognizeRevenue, Revenue.ViewSchedule → RevenueRecognizedNotification → RevenueByInvoiceReport, DeferredRevenueAgingReport → FinancialDashboard → RevenueRecognitionAI
**Status:** ✅ Full Trace

## Project Milestone to Invoice
**Chain:** Milestone → InvoiceGeneration → MilestoneBillingView, ProgressBillingForm, InvoicePreviewView → POST /milestones/:id/generate-invoice, GET /invoices/by-milestone, POST /milestones/billing-rules → Milestone, Invoice, BillingRule → MilestoneBillingRule, ProgressBillingRule, MilestoneCompletionValidationRule → Milestones.GenerateInvoice, AR.Invoices.View → MilestoneInvoiceGeneratedNotification → MilestoneBillingReport, ProgressBillingSummaryReport → ProjectDashboard, FinancialDashboard → MilestoneBillingAI
**Status:** ✅ Full Trace

## NCR to Corrective Maintenance
**Chain:** NCR → CorrectiveWorkOrder → NCRToWorkOrderView, RepairPriorityForm, AssetLinkingView → POST /ncrs/:id/create-work-order, GET /work-orders/by-ncr, POST /ncrs/:id/link-asset → NCR, WorkOrder, Asset → NCRWorkOrderEscalationRule, PriorityMappingRule, AssetLinkingRule → NCRs.CreateWorkOrder, WorkOrders.ViewLinkedNCR → WorkOrderCreatedFromNCRNotification → NCRToWOResolutionReport, NCRImpactOnAssetsReport → QualityDashboard, MaintenanceDashboard → NCRWorkOrderAutoCreationAI
**Status:** ✅ Full Trace

## Supplier Performance to Procurement Decision
**Chain:** SupplierPerformance → SupplierSelection → PerformanceToSourcingView, SupplierScoreIntegrationView, PreferredSupplierListForm → GET /supplier-performance/:id/scorecard, POST /rfqs/:id/apply-supplier-weights, PUT /suppliers/:id/preferred-status → SupplierPerformance, RFQ, Supplier → PerformanceWeightRule, PreferredSupplierRule, SupplierScoreIntegrationRule → SupplierPerformance.View, RFQs.ApplySupplierWeights → SupplierScoreUpdatedNotification → PerformanceInfluencedAwardReport, PreferredSupplierImpactReport → ProcurementDashboard → PerformanceWeightOptimizationAI
**Status:** ✅ Full Trace

## Document Approval to Contract Execution
**Chain:** DocumentApproval → ContractExecution → DocumentToContractView, ApprovalToSignatureFlow, ContractClauseLinkingView → POST /documents/approvals/:id/link-contract, GET /contracts/by-approval, POST /contracts/:id/attach-approved-document → DocumentApproval, Contract, ContractClause → DocumentToContractLinkRule, ApprovalAsSignatureRule, ClauseExtractionRule → Approvals.LinkContract, Contracts.AttachDocument → ContractExecutedFromDocumentNotification → DocumentToContractCycleReport → DocumentDashboard, ExecutiveDashboard → ClauseExtractionAI
**Status:** ✅ Full Trace

## Employee Onboarding to Project Resource Allocation
**Chain:** EmployeeOnboarding → ResourceAllocation → OnboardingToProjectView, SkillMatchingForm, ResourceAssignmentForm → POST /employees/:id/allocate-to-project, GET /projects/:id/team, POST /employees/:id/skills → Employee, ProjectTeam, Skill → SkillMatchRule, AllocationConflictRule, OnboardingCompletionRule → Employees.AllocateToProject, Projects.ManageTeam → EmployeeAllocatedToProjectNotification → ResourceAllocationReport, SkillUtilizationReport → HRDashboard, ProjectDashboard → SkillMatchingAI
**Status:** ✅ Full Trace

## Leave to Timesheet to Payroll
**Chain:** Leave → TimesheetAdjustment → PayrollCalculation → LeaveToTimesheetView, TimesheetAdjustmentForm, PayrollIntegrationView → POST /leaves/:id/adjust-timesheet, GET /timesheets/by-leave, POST /payroll/apply-leave-adjustments → LeaveRequest, Timesheet, PayrollRun → LeaveToTimesheetMappingRule, PaidLeaveCalculationRule, LeaveDeductionRule → Leaves.AdjustTimesheet, Payroll.ApplyLeaveAdjustments → LeaveAppliedToTimesheetNotification → LeaveImpactOnPayrollReport → HRDashboard, FinancialDashboard → LeavePayrollAutoReconciliationAI
**Status:** ✅ Full Trace
