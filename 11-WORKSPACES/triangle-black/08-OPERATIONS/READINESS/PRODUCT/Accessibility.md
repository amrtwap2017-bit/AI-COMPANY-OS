# 02 — Accessibility

> Validating WCAG 2.1 accessibility compliance for Triangle Black.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-03 | Design-System.md | Accessibility section |
| PHASE-03 | UX-Architecture.md | Accessibility principles |

## Compliance Target

| Level | Target | Current | Status |
|-------|--------|---------|--------|
| WCAG 2.1 A | Required | — | ❌ |
| WCAG 2.1 AA | Desired (V2) | — | Deferred |

## Validation Checklist

### Perceivable

- [ ] All images have alt text
- [ ] Color not sole means of conveying information
- [ ] Sufficient color contrast (4.5:1 for normal text)
- [ ] Text resizable up to 200%

### Operable

- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Focus indicators visible
- [ ] Skip navigation link present
- [ ] Touch targets at least 44x44px on mobile

### Understandable

- [ ] Language attribute set on HTML element
- [ ] Form inputs have associated labels
- [ ] Error messages are descriptive
- [ ] Consistent navigation across all pages

### Robust

- [ ] ARIA landmarks used for page structure
- [ ] Custom components have appropriate ARIA roles
- [ ] Screen reader testing completed (NVDA, VoiceOver)

## Known Issues

| Issue | Severity | Target Fix |
|-------|----------|------------|
| — | — | — |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| UX Lead | | | |

**Status:** ❌ NOT VALIDATED
