# 10-AI-COPILOTS — Workflows

## Agent Execution Pattern

```
[Domain Event] → AI Gateway → Agent Selection → Execute Agent → Output Action
     ↓              ↓              ↓                 ↓              ↓
  lead.created   Event bus    Route to       Run rules/     Save result
                  with        Lead Scoring   ML model      Trigger action
                  payload     Agent                        or notification
```

## Lead Scoring Flow

```
lead.created event → LeadScoringAgent → Score (0-100)
    │
    ├── Score ≥ 61 → Assign to senior rep → Notify
    ├── Score 31-60 → Assign to available rep → Notify
    └── Score ≤ 30 → Nurture sequence → Add to nurture campaign
```
