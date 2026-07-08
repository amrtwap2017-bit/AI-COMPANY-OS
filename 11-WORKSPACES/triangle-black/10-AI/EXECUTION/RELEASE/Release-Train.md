# Release Train Model

## Purpose

The Release Train model establishes a predictable, time-based release cadence. Features board the train at scheduled intervals, and the train departs on time regardless of which features are ready.

## Core Principle

**The train leaves the station on schedule.**

If a feature is not ready by the departure date, it waits for the next train. This ensures predictable delivery cycles and prevents schedule slippage.

## Train Intervals

| Train Type | Interval | Departure Day | Duration |
|---|---|---|---|
| Major Release | Every 4 weeks | Monday, Week 1 | Full release lifecycle |
| Minor Release | Every 2 weeks | Monday, Week 2 & 4 | Standard release lifecycle |
| Patch Release | As needed | Wednesday | Expedited (2-3 days) |
| Hotfix | On demand | Immediate | Emergency (hours) |

## Release Train Schedule

```
Week 1      Week 2      Week 3      Week 4
│           │           │           │
├─ Minor ───┤           ├─ Minor ───┤
│           │           │           │
├─────────── Major Release ─────────┤
│                                   │
└───────────────────────────────────┘
```

## Feature Boarding Process

1. **Feature Complete**: Feature passes all quality gates and is ready for release.
2. **Boarding Window**: Features can board the train during the boarding window (3 days before departure).
3. **Boarding Cutoff**: At the cutoff time, the release scope is frozen. No additional features are accepted.
4. **Train Departure**: The release candidate is built and enters the verification phase.

## What Happens If a Feature Misses the Train

If a feature misses its intended train:

1. The feature is removed from the current release scope.
2. The feature owner is notified with the reason.
3. The feature is automatically considered for the next available train.
4. Stakeholders are informed of the deferral.
5. Priority may be reassessed for the next cycle.

## Hotfix Override Process

Hotfixes bypass the regular release train:

1. A hotfix is triggered for P0 production issues only.
2. Hotfix follows the expedited quality process (see [Hotfix Process](Hotfix-Process.md)).
3. Hotfix patches are merged into the main branch and deployed immediately.
4. Hotfix changes are incorporated into the next scheduled release.

## Release Train Calendar Template

```
# Release Train Calendar - Q<quarter> <year>

## Major Releases
| Release | Version | Boarding Cutoff | Departure | Deployment |
|---|---|---|---|---|
| January  | vX.Y.0  | Jan 25          | Jan 28     | Jan 30     |
| February | vX.Y.0  | Feb 22          | Feb 25     | Feb 27     |
| March    | vX.Y.0  | Mar 22          | Mar 25     | Mar 27     |

## Minor Releases
| Release | Version | Boarding Cutoff | Departure | Deployment |
|---|---|---|---|---|
| Week 2  | vX.Y.Z  | Jan 11          | Jan 14     | Jan 16     |
| Week 4  | vX.Y.Z  | Jan 25          | Jan 28     | Jan 30     |
| ...     | ...     | ...             | ...        | ...        |
```

## Release Train Roles

| Role | Responsibility |
|---|---|
| Train Conductor (Release Manager) | Manages the schedule, boarding, and departure. |
| Station Master (Engineering Lead) | Ensures features are ready for boarding. |
| Ticket Master (Product Owner) | Decides which features board which train. |
| Signal Operator (QA Lead) | Verifies train readiness before departure. |

## Communication

For each train departure, the following communication is sent:

1. **Boarding Call**: 1 week before departure — list of features intended for the train.
2. **Final Boarding Call**: 2 days before departure — final scope confirmation.
3. **Departure Notice**: At departure — release candidate ready for verification.
4. **Arrival Notice**: At deployment — release deployed and available.

## Exceptions

Exceptions to the release train schedule:

- Catastrophic production issues may trigger an unscheduled release.
- Regulatory requirements may mandate an unscheduled release.
- Executive approval is required for any schedule exception.

Exception releases follow the same process but with compressed timelines.
