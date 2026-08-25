# LOCAL AI ENGINEERING OS

This directory is the persistent memory and operating system for the local AI engineering agent.

## Structure

| Directory | Purpose |
|-----------|---------|
| constitution/ | Non-negotiable engineering, architecture, security rules |
| context/ | Project master context, architecture, domain, technology |
| memory/ | Decisions, discoveries, failures, lessons, patterns |
| roadmap/ | Master roadmap, current phase, backlog |
| sprints/ | Sprint definitions — active, completed, archived |
| tasks/ | Task lifecycle — ready, active, review, blocked, completed |
| reports/ | Audits, reviews, test reports, checkpoints |
| state/ | Machine-readable project, sprint, agent state |
| intelligence/ | Repository maps, dependency maps, test maps |
| knowledge/ | Documentation index, document registry |
| verification/ | Gates, policies, commands |
| sessions/ | Per-session records for handoffs |

## Rules

- Never delete this directory
- Always update state after task completion
- Always checkpoint before closing a session
- Never commit secrets or credentials
- Never modify forbidden scope

## Status

See: .ai/state/project-state.json
See: .ai/reports/checkpoints/LATEST.md
