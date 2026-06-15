# Example skills repository

These folders are **real output** from the SENTIENT//OS forge — the exact structure that gets
published to your GitHub skills repo. Use them to see what a generated package looks like, or as a
template for the layout your install commands point at.

```
<slug>/
├─ SKILL.md
├─ manifest.json
├─ test.json
└─ references/examples.md
```

## Included

| Skill | Category | Safety | Notes |
|---|---|---|---|
| [`token-scam-analyzer`](token-scam-analyzer/) | crypto | safe | Standard analysis skill. |
| [`polymarket-market-watcher`](polymarket-market-watcher/) | prediction-markets | needs manual review | Generated from an *"auto bet"* prompt — the safety engine **rewrote it** into an analysis-only watcher (no auto-bet, no order placement, no signing). |

The second example demonstrates the safety policy in action: a high-risk execution request never
produces an execution skill — it becomes a read-only watcher flagged for human approval.

## Installing one

```
install the token-scam-analyzer skill from https://github.com/OWNER/REPO/tree/main/token-scam-analyzer
```

Replace `OWNER/REPO` with your repository once published.
