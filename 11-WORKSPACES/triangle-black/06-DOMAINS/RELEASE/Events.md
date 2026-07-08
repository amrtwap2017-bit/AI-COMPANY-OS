# 99-RELEASE — Events

| Event | Trigger | Handler |
|-------|---------|---------|
| release.deployed | Production deploy | NotificationService (all users) |
| release.rolled_back | Rollback executed | NotificationService (team) |
| defect.logged | New defect | NotificationService (QA manager, dev lead) |
| defect.fixed | Defect resolved | NotificationService (QA engineer to verify) |
| uat.signed_off | UAT completed | Release pipeline triggers production deploy |
