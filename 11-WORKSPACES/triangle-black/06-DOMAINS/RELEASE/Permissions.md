# 99-RELEASE — Permissions

| Permission | Action | Roles |
|------------|--------|-------|
| release:create | Create release | RELEASE_MANAGER |
| release:deploy | Deploy to environment | RELEASE_MANAGER |
| test:execute | Execute tests | QA_ENGINEER, UAT_TESTER |
| defect:log | Log defect | QA_ENGINEER, UAT_TESTER |
| defect:fix | Fix defect | Developer (via code) |
| defect:verify | Verify fix | QA_ENGINEER |
| uat:signoff | Approve UAT | QA_MANAGER, UAT_TESTER lead |
