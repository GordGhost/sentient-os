# Token Scam Analyzer — Reference & Examples

Supporting material the agent may load while running the `token-scam-analyzer` skill.

## Risk / signal checklist (crypto)

- Deployer wallet age, funding source, and prior deploys.
- Holder concentration (top-10 %, sniper clusters, fresh-wallet bundles).
- Contract: mint authority, freeze authority, hidden fees, honeypot patterns.
- Liquidity: locked vs unlocked, LP burn, removable liquidity.
- Launch mechanics: stealth vs announced, bot activity, wash trading.

## Worked example

**User:** "assess the risk of the token at 0xABCD…1234 on Base and tell me if it looks like a scam."

**Agent (using token-scam-analyzer):**

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
