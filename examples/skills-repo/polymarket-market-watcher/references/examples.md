# Polymarket Market Watcher — Reference & Examples

Supporting material the agent may load while running the `polymarket-market-watcher` skill.

## Risk / signal checklist (prediction-markets)

- Liquidity depth and spread on each outcome.
- Resolution source and ambiguity in the question text.
- Recent odds movement and what news drove it.
- Concentration: is one wallet moving the market?

## Worked example

**User:** "summarize the odds and risk for the 'will X happen by Friday' market and give me manual decision notes."

**Agent (using polymarket-market-watcher):**

```
summary:      One-paragraph plain-language read of the subject.
findings:     - Evidence item 1 (source)
              - Evidence item 2 (source)
risk_flags:   - [HIGH] Concrete issue, with the evidence that triggered it
              - [LOW]  Minor concern
final_verdict: A calibrated conclusion — never a profit guarantee.
uncertainty:  What could change this verdict; what data was missing.
```

## Notes

- Keep facts and assumptions visibly separated.
- Cite the tool or source behind every material claim.
- Prefer "I could not verify X" over guessing.
