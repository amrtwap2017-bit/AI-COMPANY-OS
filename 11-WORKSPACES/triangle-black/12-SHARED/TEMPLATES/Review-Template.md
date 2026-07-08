# Artifact Review Record

## Review ID
`[REV-XXX]`

## Review Type
`[Architecture / Code / Security / Performance / Documentation / UX / Design]`

## Artifact Reviewed
| Artifact | Version | Author | Repository / Path |
|---|---|---|---|
| `[ADR / PR / Design Doc / Test Plan]` | `[v1.2]` | `[Name]` | `[path/to/artifact]` |

## Review Criteria
| Criterion | Weight | Description |
|---|---|---|
| `[Correctness]` | `[Critical/High/Medium/Low]` | [Does the artifact correctly solve the stated problem?] |
| `[Completeness]` | `[Critical/High/Medium/Low]` | [Are all aspects of the problem addressed?] |
| `[Consistency]` | `[Critical/High/Medium/Low]` | [Is the approach consistent with existing architecture and conventions?] |
| `[Clarity]` | `[Critical/High/Medium/Low]` | [Is the artifact well-documented and understandable?] |
| `[Testability]` | `[Critical/High/Medium/Low]` | [Can the changes be adequately tested?] |

## Findings

### Critical Findings
| # | Location | Description | Recommendation |
|---|---|---|---|
| 1 | `[File:Line]` | [Description of the critical issue] | [Recommended fix] |
| 2 | `[File:Line]` | [Description of the critical issue] | [Recommended fix] |

### High Findings
| # | Location | Description | Recommendation |
|---|---|---|---|
| 1 | `[File:Line]` | [Description of the high-severity issue] | [Recommended fix] |
| 2 | `[File:Line]` | [Description of the high-severity issue] | [Recommended fix] |

### Medium Findings
| # | Location | Description | Recommendation |
|---|---|---|---|
| 1 | `[File:Line]` | [Description of the medium-severity issue] | [Recommended fix] |

### Low / Nitpick Findings
| # | Location | Description | Recommendation |
|---|---|---|---|
| 1 | `[File:Line]` | [Description of the low-severity issue] | [Recommended fix] |

## Severity Definitions
| Severity | Definition | Required Action |
|---|---|---|
| **Critical** | Blocks delivery; security vulnerability; data loss risk | Must fix before proceeding |
| **High** | Significant quality, performance, or maintainability concern | Should fix before merge |
| **Medium** | Minor issue; deviation from best practices | Fix when convenient; track in backlog |
| **Low** | Nitpick; style preference; optional improvement | Address if time permits |

## Verdict
- **Result:** `[Pass / Pass with Comments / Conditional Pass / Fail]`
- **Conditions (if Conditional Pass):** `[Items that must be addressed before final approval]`

## Overall Assessment
[Summarize the overall quality of the artifact. Highlight strengths and key areas for improvement.]

## Recommendations
1. [Actionable recommendation 1]
2. [Actionable recommendation 2]
3. [Process improvement suggestion]

## Review Metadata
| Field | Value |
|---|---|
| **Reviewer** | `[Name / Role]` |
| **Review Date** | `[YYYY-MM-DD]` |
| **Time Spent** | `[X hours]` |
| **Review Round** | `[Round 1 / Round 2]` |
| **Tools Used** | `[SonarQube / CodeQL / ESLint / manual]` |

## Traceability
| Linked Item | ID |
|---|---|
| **Pull Request** | `[PR-XXX]` |
| **User Story** | `[US-XXX]` |
| **Defect** | `[BUG-XXX]` |
