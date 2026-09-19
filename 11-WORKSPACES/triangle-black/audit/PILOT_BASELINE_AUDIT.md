# Pilot and Baseline Audit

Pilot source routes compute a baseline live from current tables on every request (`capture_baseline()` is called by `/pilot/status`, `/pilot/baseline`, `/pilot/roi`). No immutable persisted baseline/version/snapshot was verified. A comparison made later can therefore be retroactively changed by operational data changes.

The validator reports pilot baseline and PDF report paths absent in the imported active application. Pilot baseline, metric integrity, executive report, and real pilot state are NOT VERIFIED.
