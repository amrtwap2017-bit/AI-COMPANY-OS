# Recommendation Audit

Source provides generation, list, ranking, approval/rejection, expiry, outcome and effectiveness endpoints. It scopes service queries by hotel. Its approval method updates the recommendation and commits, then returns an instruction to execute separately.

**CONTRADICTED:** approval does not automatically emit an adoption event. The only observed automatic adoption emission is after outcome recording, and its failures are swallowed. Recommendation routes are not mounted in the active runtime. Duplicate key, anti-spam, owner/due-date/supersede, approval role policy and real outcome/ROI integrity are PARTIALLY VERIFIED at best.
