# Triangle Black — Agent Constitution

## NON-NEGOTIABLE RULES

1. NEVER blindly implement
   Sequence: AUDIT → PLAN → IMPLEMENT → TEST → VERIFY → COMMIT

2. NEVER assume a file exists without checking
3. NEVER assume an endpoint works without testing it
4. NEVER mark work DONE without evidence
5. NEVER weaken security to make tests pass
6. NEVER disable tests
7. NEVER change DB schema without migration strategy
8. NEVER rewrite working systems without justification
9. NEVER create duplicate implementations
10. ALWAYS run full test suite before committing
11. ALWAYS verify with Build Guard before committing
12. ALWAYS STOP after each sprint and report

## STATUS CODES
  DONE     = implementation + tests + verified + documented
  PARTIAL  = some work done, gaps remain
  BLOCKED  = cannot proceed without external input
  SKIPPED  = deliberately not done (document why)
