# 11 — Voice AI

> Voice AI capabilities for the platform.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — AI-Research.md | AI research |

## Voice AI Use Cases

| Use Case | Language | Description | Value | Timeline |
|----------|----------|-------------|-------|----------|
| Voice room service | Arabic/English | Guest orders via voice | Guest experience | H2 |
| Voice housekeeping | Arabic | Staff reports via voice | Efficiency | H2 |
| Voice maintenance | Arabic | Report issues by voice | Speed | H2 |
| Voice concierge | Arabic/English | Guest inquiries by voice | Guest experience | H3 |
| Voice admin | Arabic | Hands-free data entry | Efficiency | H3 |

## Architecture

```
Voice ──► ASR ──► NLP ──► Intent ──► Action ──► Response ──► TTS
 Input    │         │       │          │          │          │
        Whisper   Arabic   Classify  Execute   Generate   Text-to-
        (OpenAI)  model    + entity  workflow  response   speech
                          extract
```

## Arabic Voice Considerations

| Challenge | Mitigation | Timeline |
|-----------|-------------|----------|
| Dialect variation | Train on Egyptian + MSA | H2 pilot |
| Accent handling | Data diversity | H2 |
| Domain vocabulary | Custom vocabulary injection | H2 |
| Real-time performance | Edge inference | H3 |
| Noise handling | Noise suppression preprocessing | H2 |

## Voice AI Strategy

| Phase | Scope | Languages | Accuracy Target |
|-------|-------|-----------|-----------------|
| H2 Pilot | Room service, housekeeping | Arabic (Egyptian) | 80% intent recognition |
| H3 Scale | All staff use cases | Arabic + English | 90% intent recognition |
| H4 Production | Guest-facing concierge | Arabic, English, French | 95% intent recognition |

## Voice AI Budget

| Item | H2 Cost | H3 Cost |
|------|---------|---------|
| ASR API credits | $200/mo | $500/mo |
| TTS API credits | $100/mo | $300/mo |
| Training data collection | $1K | $3K |
| Hardware (microphones) | $500 | $2K |
