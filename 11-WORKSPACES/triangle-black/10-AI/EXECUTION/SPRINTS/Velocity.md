# Velocity

## Overview

Velocity is the primary planning metric for sprint capacity. It measures the amount of work (in story points) an AI execution team can complete in a sprint. Velocity is derived from historical data, not from theoretical ideal capacity. It is used to forecast how much work can be reliably delivered in future sprints.

**Velocity is a planning tool, not a performance metric.** It should never be used to evaluate team or individual productivity. Velocity varies naturally based on sprint composition, task complexity, team stability, and environmental factors. The goal is predictability, not maximization.

## How Velocity Is Calculated

### Definition

```
Velocity = Average Story Points Completed per Sprint
```

### Calculation Method

Velocity is calculated as a **rolling average** of the last 3-5 sprints (excluding the current sprint):

```
Velocity = (Sum of completed story points for the last N sprints) / N
```

- **N = 3** for teams with fewer than 5 sprints of history.
- **N = 5** for teams with 5+ sprints of history (more stable average).

### Example

| Sprint | Planned (Points) | Completed (Points) |
|---|---|---|
| Sprint 1 | 40 | 38 |
| Sprint 2 | 42 | 44 |
| Sprint 3 | 45 | 42 |
| Sprint 4 | 44 | 47 |
| Sprint 5 | 48 | 45 |

**Velocity (last 5 sprints):** `(38 + 44 + 42 + 47 + 45) / 5 = 43.2 points`

**Velocity used for Sprint 6 planning:** 43 points (rounded down; always round down for planning).

### Initial Velocity

For teams without historical data (first sprint), velocity is estimated based on:

1. **Reference class** — Velocity of similar teams working on similar systems.
2. **Top-down estimate** — Program Manager AI assessment of total team capacity in points.
3. **Bottom-up estimate** — Sum of individual agent estimated capacity, normalized to story points.

Initial velocity is clearly marked as an estimate. After the first sprint, actual velocity replaces the estimate. After 3 sprints, the rolling average method takes over.

## Velocity Normalization

Velocity must be normalized when sprint composition differs significantly. Normalization adjusts for:

| Factor | Normalization | Example |
|---|---|---|
| **Sprint length** | Scale proportionally | A 1-week sprint's velocity is ~50% of a 2-week sprint |
| **Team composition** | Scale by available agent count | 3 agents → 2 agents: multiply velocity by 2/3 |
| **Environment availability** | Deduct non-available time | 1 day of CI/CD downtime: reduce sprint by 1 day |
| **Work type mix** | Adjust if sprint is unusually heavy in a task type | Infrastructure-heavy sprints typically have lower velocity than feature sprints |

Normalized velocity is used for capacity planning only — the raw velocity is still tracked in the metrics repository for trend analysis.

## Capacity Planning Formula

```
Available Capacity = Velocity × (1 - Buffer)
```

**Buffer: 20%** (standard)

The buffer accounts for:
- Defect fixing (5-10%)
- Unplanned work (5-10%)
- Overhead — context loading, review, documentation, communication (5-10%)

### Example

```
Velocity: 43 points
Buffer: 20%
Available Capacity: 43 × 0.8 = 34.4 → 34 points (rounded down)
```

Team plans for **34 story points** of work in the upcoming sprint. The remaining ~9 points of implicit capacity are reserved for defects, unplanned work, and overhead.

### When to Adjust the Buffer

| Condition | Buffer Adjustment | Rationale |
|---|---|---|
| Consistently low rework rate (< 5%) over last 5 sprints | Reduce to 15% | Quality is high; less buffer needed for defects |
| Consistently high rework rate (> 20%) over last 3 sprints | Increase to 25% | More buffer needed to account for rework cycles |
| New team or new domain | Increase to 25-30% | Unknown unknowns; conservative approach |
| Stable, mature product with few defects | Reduce to 15% | Low defect inflow reduces unplanned work |

The buffer should be reviewed every 5 sprints and adjusted based on actual buffer consumption data.

## When to Re-Forecast Velocity

Velocity is re-forecasted (i.e., the rolling average is recalculated) at the **end of every sprint**, after the sprint metrics are finalized. The new velocity takes effect for the next sprint planning.

### Re-forecast Triggers

| Trigger | Action |
|---|---|
| **Standard** — End of every sprint | Recalculate rolling average with latest completed points |
| **Sprint length change** | Recaculate with normalized values; use at least 3 sprints of same-length data |
| **Team size change** (agent added/removed) | Reset rolling window; initial estimate + first actual sprint; new velocity established over 3 sprints |
| **Significant domain change** (new product, new tech stack) | Reset to initial estimate; treat as new team |
| **Outlier sprint** (velocity > 2× standard deviation from mean) | Exclude outlier from rolling average; document reason |
| **More than 2 sprint gap** (no execution sprints) | Reset to initial estimate; previous velocity is stale |

## Velocity Trend Analysis

### What to Look For

| Trend | Interpretation | Action |
|---|---|---|
| **Stable** (velocity within ±10% over 5+ sprints) | Predictable team; reliable forecasting | Maintain current practices |
| **Upward trend** (velocity increasing consistently) | Team improving, process maturing, or tasks becoming easier | Investigate: is velocity increasing due to genuine improvement or because of quality shortcuts? |
| **Downward trend** | Team facing challenges, complexity increasing, or process regressing | Investigate root causes in retrospective |
| **High variance** (±25% or more between sprints) | Inconsistent planning or execution | Check planning quality: are story points consistently applied? Are tasks well-defined? |
| **Sudden spike/drop** (> 2× or < 0.5× recent average) | Outlier event | Investigate and exclude from rolling average |

### Velocity Dashboard

```
Velocity Trend (Last 10 Sprints)
Points
50 ┤
45 ┤  ●   ●     ●     ●      ●──●──●──●──●
40 ┤     ●──●──●  ●──●                    ●
35 ┤
30 ┤
   └───┬───┬───┬───┬───┬───┬───┬───┬───┬───
      1   2   3   4   5   6   7   8   9  10  Sprint
      ● Actual   ── Rolling Average (5-sprint)
```

## Common Velocity Mistakes

| Mistake | Why It's a Problem |
|---|---|
| Using velocity as a target ("we must complete 50 points this sprint") | Encourages padding estimates, cutting quality, or manipulating story points |
| Comparing velocity across teams | Teams have different point scales, domain complexity, and contexts; comparison is meaningless |
| Changing the point scale mid-stream | Breaks historical trend; all previous velocity data becomes incomparable |
| Including partially completed work in velocity | Only fully completed, accepted work counts. Partial work inflates velocity and degrades predictability |
| Planning to 100% of velocity every sprint | Leaves no room for defects and unplanned work. Always use the capacity formula with buffer |
