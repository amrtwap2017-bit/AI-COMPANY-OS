# 99-RELEASE — Notifications

| Event | Recipient | Message |
|-------|-----------|---------|
| Release deployed | All users | "Triangle Black v{version} deployed — see what's new" |
| New defect | QA Manager, Dev Lead | "Defect #{id}: {severity} in {domain}" |
| Defect fixed | QA Engineer | "Defect #{id} fixed — ready for verification" |
| UAT signed off | Release Manager | "UAT complete — ready for production deploy" |
| Rollback executed | All team | "Release v{version} rolled back — {reason}" |
