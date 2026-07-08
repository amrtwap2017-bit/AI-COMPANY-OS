# Human-in-the-Loop Review System (V2+)

## Overview

The review system manages the interaction between AI suggestions and human decision-making. Every AI suggestion follows a lifecycle: created → reviewed → accepted/rejected → learned from.

## Suggestion Lifecycle

```
                      ┌──────────────────┐
                      │  AI Generates     │
                      │  Suggestion       │
                      └────────┬─────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │  Confidence       │
                      │  Assessment       │
                      └────────┬─────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              High Confidence        Low Confidence
                    │                     │
                    ▼                     ▼
          ┌──────────────────┐  ┌──────────────────┐
          │  Auto-present to │  │  Flag for         │
          │  User            │  │  Mandatory Review  │
          └────────┬─────────┘  └────────┬─────────┘
                   │                     │
                   └──────────┬──────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │  User Reviews     │
                     │  Suggestion       │
                     └────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              User Accepts         User Rejects
                    │                   │
                    ▼                   ▼
          ┌──────────────────┐  ┌──────────────────┐
          │  Execute Action   │  │  Record Rejection │
          │  (with approval)  │  │  + Reason         │
          └────────┬─────────┘  └────────┬─────────┘
                   │                     │
                   └──────────┬──────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │  Store Feedback   │
                     │  (Improve Model)  │
                     └──────────────────┘
```

## UI Component

```typescript
// AI suggestion component in React
interface AISuggestionProps {
  suggestion: Suggestion;
  onAccept: (suggestion: Suggestion) => void;
  onReject: (suggestion: Suggestion, reason: string) => void;
  onEdit: (suggestion: Suggestion, edits: Partial<Suggestion>) => void;
}

const AISuggestionBanner: React.FC<AISuggestionProps> = ({
  suggestion,
  onAccept,
  onReject,
  onEdit,
}) => {
  return (
    <div className="ai-suggestion">
      <div className="ai-suggestion-header">
        <span className="ai-badge">AI Suggested</span>
        <span className={`confidence confidence-${suggestion.confidence}`}>
          {suggestion.confidence}% confidence
        </span>
      </div>

      <div className="ai-suggestion-content">
        {/* Suggestion details */}
        {suggestion.type === 'quotation' && <QuotationPreview data={suggestion.data} />}
        {suggestion.type === 'priority' && <PriorityBadge priority={suggestion.data} />}
        {suggestion.type === 'schedule' && <SchedulePreview data={suggestion.data} />}

        {/* Reasoning */}
        <details className="ai-reasoning">
          <summary>Why this suggestion?</summary>
          <p>{suggestion.reasoning}</p>
          {suggestion.sources?.length > 0 && (
            <div className="ai-sources">
              <strong>Sources:</strong>
              <ul>
                {suggestion.sources.map((source, i) => (
                  <li key={i}>{source}</li>
                ))}
              </ul>
            </div>
          )}
        </details>
      </div>

      <div className="ai-suggestion-actions">
        <button onClick={() => onAccept(suggestion)} className="btn-primary">
          Accept
        </button>
        <button onClick={() => onEdit(suggestion)} className="btn-secondary">
          Edit
        </button>
        <button onClick={() => onReject(suggestion)} className="btn-danger">
          Dismiss
        </button>
      </div>

      {/* Rejection reason (shown when rejecting) */}
      <RejectionReasonModal
        isOpen={showRejectionModal}
        onSubmit={(reason) => onReject(suggestion, reason)}
      />
    </div>
  );
};
```

## Confidence Scoring

```typescript
// src/ai/review/confidence.service.ts
@Injectable()
export class ConfidenceService {
  calculate(suggestion: Suggestion, context: SuggestionContext): number {
    const scores: number[] = [];

    // 1. Historical data availability (0-40 points)
    scores.push(this.scoreHistoricalData(context));

    // 2. Pattern match strength (0-30 points)
    scores.push(this.scorePatternMatch(suggestion, context));

    // 3. Model confidence (0-20 points)
    scores.push(this.scoreModelConfidence(suggestion));

    // 4. Edge case detection (0-10 points)
    scores.push(this.scoreEdgeCases(suggestion, context));

    const total = scores.reduce((a, b) => a + b, 0);

    // Categorize
    if (total >= 80) return 'high';
    if (total >= 50) return 'medium';
    return 'low';
  }

  private scoreHistoricalData(context: SuggestionContext): number {
    const { similarCases, dataFreshness } = context;

    if (similarCases >= 50 && dataFreshness < 90) return 40;
    if (similarCases >= 20) return 30;
    if (similarCases >= 5) return 20;
    if (similarCases >= 1) return 10;
    return 0;
  }

  private scorePatternMatch(suggestion: Suggestion, context: SuggestionContext): number {
    const similarity = context.similarityToHistorical || 0;

    if (similarity > 0.9) return 30;
    if (similarity > 0.7) return 20;
    if (similarity > 0.5) return 10;
    return 5;
  }

  private scoreModelConfidence(suggestion: Suggestion): number {
    return Math.round(suggestion.modelConfidence * 20);
  }

  private scoreEdgeCases(suggestion: Suggestion, context: SuggestionContext): number {
    let score = 10;

    // Deduct for edge cases
    if (context.isFirstTimeForClient) score -= 3;
    if (context.value > 10000) score -= 2;  // High value
    if (context.isNewServiceType) score -= 3;
    if (context.seasonalAnomaly) score -= 2;

    return Math.max(0, score);
  }
}
```

## Review Thresholds

```typescript
// src/ai/review/review-policy.ts
export const REVIEW_POLICY = {
  // Confidence-based routing
  confidenceThresholds: {
    autoApprove: 95,     // Future V3: auto-approve above this
    suggestOnly: 80,     // Present to user with accept/reject
    requireReview: 50,   // Mandatory human review
    requireExpert: 30,   // Escalate to senior/expert user
    discard: 10,         // Don't show (too low confidence)
  },

  // Mandatory review triggers (regardless of confidence)
  mandatoryReview: {
    highValue: 5000,          // $5,000+ suggestions require review
    firstTimeAction: true,     // First suggestion for a new client
    newServiceType: true,      // Service type not previously performed
    weekendSpecial: true,      // Non-standard scheduling
    regulatoryChange: true,    // Recent regulation change in this area
    clientComplaint: true,     // Client has recent complaint
  },

  // Escalation rules
  escalation: {
    rejectStreak: 3,          // Escalate if 3 consecutive suggestions rejected
    highValueOverride: 10000, // $10,000+ requires manager approval
    complianceRelated: true,  // Compliance suggestions always to compliance officer
  },
};
```

## Feedback Storage

```typescript
// src/ai/review/feedback.service.ts
@Injectable()
export class FeedbackService {
  async recordFeedback(feedback: SuggestionFeedback): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO ai.suggestion_feedback (
        suggestion_id,
        agent_type,
        input,
        suggestion,
        accepted,
        edited_suggestion,
        rejection_reason,
        user_id,
        confidence,
        latency_ms,
        template_version
      ) VALUES (
        ${feedback.suggestionId},
        ${feedback.agentType},
        ${JSON.stringify(feedback.input)}::jsonb,
        ${JSON.stringify(feedback.suggestion)}::jsonb,
        ${feedback.accepted},
        ${feedback.editedSuggestion ? JSON.stringify(feedback.editedSuggestion) : null}::jsonb,
        ${feedback.rejectionReason},
        ${feedback.userId},
        ${feedback.confidence},
        ${feedback.latencyMs},
        ${feedback.templateVersion}
      )
    `;
  }

  async getMetrics(agentType: string, period: { start: Date; end: Date }): Promise<AgentMetrics> {
    const metrics = await this.prisma.$queryRaw`
      SELECT
        COUNT(*) as total_suggestions,
        SUM(CASE WHEN accepted THEN 1 ELSE 0 END) as accepted_count,
        AVG(CASE WHEN accepted THEN confidence ELSE NULL END) as avg_accepted_confidence,
        AVG(CASE WHEN NOT accepted THEN confidence ELSE NULL END) as avg_rejected_confidence,
        MODE() WITHIN GROUP (ORDER BY rejection_reason) as top_rejection_reason
      FROM ai.suggestion_feedback
      WHERE
        agent_type = ${agentType}
        AND created_at BETWEEN ${period.start} AND ${period.end}
    `;

    return metrics[0];
  }
}
```

## Metrics Dashboard

| Metric | Formula | Target | Purpose |
|--------|---------|--------|---------|
| Acceptance rate | Accepted / Total | > 40% | Overall AI usefulness |
| Confidence accuracy | Accepted (high conf) + Rejected (low conf) / Total | > 80% | Confidence calibration |
| Time saved | Avg time without AI − Avg time with AI | > 20% | ROI measurement |
| User satisfaction | Average rating (1-5) | > 4.0 | User experience |
| Escalation rate | Escalated / Total | < 10% | AI maturity |
| Rejection reasons | Count by reason | Track trends | Improvement areas |

## Continuous Improvement Loop

```
              ┌──────────────────────┐
              │  Collect Feedback     │
              │  (accept/reject/edit) │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Analyze Patterns     │
              │  - Common rejections  │
              │  - Low confidence     │
              │  - Edge cases         │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Update Prompts       │
              │  - Add examples       │
              │  - Fix edge cases    │
              │  - Improve context    │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  A/B Test Changes     │
              │  - Old vs new prompt  │
              │  - Measure acceptance │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Deploy Improved      │
              │  Version              │
              └──────────┬───────────┘
                         │
                         └── Repeat ──►
```
