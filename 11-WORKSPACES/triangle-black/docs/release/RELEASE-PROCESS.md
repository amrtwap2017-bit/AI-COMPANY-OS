# Release Process (NIST SSDF 1.1 Aligned)
**Framework Baseline:** NIST SP 800-218 v1.1 Secure Software Development Framework (SSDF).

## 1. Prepare the Software (PO-1)
- All functional changes must be tracked in an approved sprint task.
- Build Guard pre-commit validation is mandatory on all check-ins.

## 2. Protect the Software (PS-1)
- Verify code integrity: Static analysis checks scan for exposed secrets.
- Dependency lockdown: Explicit version bounds inside `pyproject.toml`.

## 3. Produce Secure Software (PW-1)
- Code Review: Principal Architect signature required for any direct router change.
- Automated Testing: Pytest suite (1980+ tests) must achieve 100% pass rate.
- E2E Validation: Playwright integration test suite must pass with 0 failures on Staging.

## 4. Respond to Vulnerabilities (RV-1)
- Immediate patching window established for any ASVS Level 1 vulnerability discovered.
