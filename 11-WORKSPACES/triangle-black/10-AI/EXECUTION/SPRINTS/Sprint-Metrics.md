# Sprint Metrics

## Overview

Sprint metrics provide objective, quantitative data on the AI execution system's performance, quality, and predictability. Metrics are captured automatically throughout the sprint and finalized at sprint end. They serve three purposes:

1. **Predictability** — Understand historical performance to plan future sprints with confidence.
2. **Quality** — Detect regressions in execution quality before they become systemic.
3. **Continuous Improvement** — Identify trends and target areas for process improvement.

## Metrics Definitions

### 1. Velocity

| Metric | Definition | How Measured |
|---|---|---|
| **Planned Velocity** | Total story points of backlog items selected for the sprint | Sum of story points in sprint backlog at planning |
| **Actual Velocity** | Total story points of *completed* backlog items at sprint end | Sum of story points of items marked Done at sprint end |
| **Velocity Accuracy** | `(Actual Velocity / Planned Velocity) × 100` | Percentage; 100% = perfect prediction |

**Purpose**: Tracks planning accuracy and trend reliability.

### 2. Story Completion Rate

| Metric | Definition | How Measured |
|---|---|---|
| **Story Completion Rate** | `(Completed Stories / Planned Stories) × 100` | Count of stories completed vs. planned |
| **Partial Completion Rate** | Stories with partial completion (some tasks done) | Count of stories with any incomplete tasks |

**Purpose**: Measures how reliably the team delivers whole features, not just tasks.

### 3. Task Completion Rate

| Metric | Definition | How Measured |
|---|---|---|
| **Task Completion Rate** | `(Completed Tasks / Planned Tasks) × 100` | Count of tasks completed vs. planned |
| **Task Completion by Agent** | Per-agent completion rate | Individual agent's completed vs. assigned tasks |

**Purpose**: Identifies task decomposition quality and per-agent execution reliability.

### 4. Quality Gate Pass Rate

| Metric | Definition | How Measured |
|---|---|---|
| **Gate Pass Rate** | `(Tasks Passing All Gates on First Attempt / Total Tasks) × 100` | Automated gate results per task |
| **Gate Pass Rate by Gate Type** | Pass rate per gate (lint, type-check, test, security, docs) | Per-gate automated results |
| **Average Gate Iterations** | Average number of attempts per task before all gates pass | Count of gate cycles per task |

**Purpose**: Measures execution quality at the individual task level. Low first-pass rate indicates insufficient quality checking before submission.

### 5. Rework Rate

| Metric | Definition | How Measured |
|---|---|---|
| **Task Rework Rate** | `(Tasks Requiring 2+ Quality Gate Iterations / Total Tasks) × 100` | Tasks with more than one quality gate cycle |
| **Rework Time** | Total hours spent on rework (tasks that failed gates) | Sum of actual hours - estimated hours for failed attempts |

**Purpose**: Quantifies the cost of quality failures. High rework rate suggests insufficient testing, unclear requirements, or rushed execution.

### 6. Cycle Time by Task Type

| Metric | Definition | How Measured |
|---|---|---|
| **Average Cycle Time** | Average wall-clock time from task start to task completion | Time from In Progress → Done for each task |
| **Cycle Time by Type** | Feature, bug fix, infrastructure, documentation, refactoring | Grouped by task type label |
| **Cycle Time by Agent** | Per-agent average cycle time | Grouped by assigned agent |

**Purpose**: Identifies which task types take longer to complete and which agents have higher throughput.

### 7. Escaped Defects

| Metric | Definition | How Measured |
|---|---|---|
| **Escaped Defects (Critical)** | Critical-severity defects found after sprint end | Count from production/staging bug reports attributed to sprint's deliverables |
| **Escaped Defects (High)** | High-severity defects found after sprint end | Count from production/staging bug reports |
| **Escaped Defects (Medium/Low)** | Medium/low-severity defects found after sprint end | Count from production/staging bug reports |
| **Defect Escape Rate** | `(Escaped Defects / Total Defects Caught) × 100` | Escaped vs. total defects (internal + escaped) |

**Purpose**: Measures the effectiveness of quality gates. A high escape rate means gates are missing defects.

### 8. AI Accuracy (First-Pass Yield)

| Metric | Definition | How Measured |
|---|---|---|
| **First-Pass Yield** | `(Tasks Completed Correctly on First Attempt / Total Tasks) × 100` | Tasks that pass all quality gates on first attempt AND meet acceptance criteria |
| **Accuracy by Agent** | Per-agent first-pass yield | Individual agent metrics |
| **Accuracy by Task Type** | First-pass yield grouped by task type | Feature, bug fix, infrastructure, etc. |

**Purpose**: Measures how often AI agents produce correct output without iteration. This is the single most important metric for agentic execution quality.

### 9. Sprint Goal Achievement

| Metric | Definition | How Measured |
|---|---|---|
| **Sprint Goal Achievement** | `Achieved (100%) / Partially Achieved (50-99%) / Not Achieved (0-49%) / Obsolete` | Assessed by Program Manager AI at Sprint Review |

**Purpose**: The ultimate outcome metric. All other metrics are secondary to whether the sprint goal was achieved.

## Dashboard Layout

```
┌────────────────────────────────────────────────────────────┐
│  SPRINT [N] METRICS DASHBOARD          Goal: [Status]      │
├────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Goal     │ │ Velocity │ │ Completion│ │ Quality  │       │
│ │ Achieved │ │ Planned  │ │ Rate     │ │ Gate     │       │
│ │   85%    │ │   50     │ │   90%    │ │  88%     │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│ ┌──────────────────────────────────────┐                    │
│ │ Cycle Time by Task Type              │                    │
│ │ Feature     ████████████████  8h      │                    │
│ │ Bug Fix     ██████████        4h      │                    │
│ │ Infra       ██████████████████ 10h    │                    │
│ │ Docs        ████████           3h     │                    │
│ └──────────────────────────────────────┘                    │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│ │ Rework Rate  │ │ Escaped      │ │ First-Pass Yield     │  │
│ │    15%       │ │ Defects: 2   │ │    78%               │  │
│ └──────────────┘ └──────────────┘ └──────────────────────┘  │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Trend: Velocity (last 5 sprints)                         ││
│ │ Sprint N-4: 42  Sprint N-3: 45  Sprint N-2: 48          ││
│ │ Sprint N-1: 47  Sprint N: 50   ▲ (upward trend)         ││
│ └──────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

## Metrics Capture Cadence

| Frequency | Metrics Captured | Action |
|---|---|---|
| **Daily** | Task completion, quality gate passes/failures, blockers | Auto-update dashboard; Program Manager AI reviews |
| **End of Sprint** | All metrics finalized | Stored in metrics repository; included in Sprint Review |
| **Rolling (every sprint)** | Velocity, trend data | Used for velocity re-forecasting and capacity planning |

## Metrics Repository

All sprint metrics are stored in a version-controlled metrics repository. Each sprint produces a `metrics-sprint-N.json` (or equivalent) file containing all metric values. The repository allows:

- Historical trend analysis across sprints.
- Data-driven capacity planning (see Velocity.md and Capacity-Planning.md).
- Regression detection: automated alerts when a metric drops below a threshold (e.g., first-pass yield below 70%, escaped critical defects > 0).

## Target Thresholds

| Metric | Target | Warning | Critical |
|---|---|---|---|
| Sprint Goal Achievement | ≥ 90% | < 80% | < 60% |
| Velocity Accuracy | 90-110% | < 80% or > 120% | < 60% or > 150% |
| Story Completion Rate | ≥ 90% | < 80% | < 60% |
| Quality Gate Pass Rate | ≥ 90% (first attempt) | < 80% | < 70% |
| Rework Rate | ≤ 10% | > 15% | > 25% |
| Escaped Defects (Critical) | 0 | 1 | 2+ |
| First-Pass Yield | ≥ 80% | < 70% | < 60% |
| Task Cycle Time (Feature) | ≤ 8h avg | > 12h avg | > 16h avg |

These thresholds should be reviewed and calibrated after the first 5 sprints based on actual performance data.
