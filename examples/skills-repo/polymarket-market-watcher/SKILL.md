---
name: polymarket-market-watcher
description: Analyze and monitor the subject, summarize odds/risk/signals, and produce manual decision notes. Analyze the relevant data, summarize odds / risk / signals, and produce manual decision notes only. The agent never executes, signs, places orders, or moves funds.
tags: [prediction-markets, odds, risk-analysis, research]
version: 1.0.0
visibility: public
---

# Polymarket Market Watcher

> **Scope guard:** Analyze the relevant data, summarize odds / risk / signals, and produce manual decision notes only. The agent never executes, signs, places orders, or moves funds.

## Purpose

Analyze and monitor the subject, summarize odds/risk/signals, and produce manual decision notes. Analyze the relevant data, summarize odds / risk / signals, and produce manual decision notes only. The agent never executes, signs, places orders, or moves funds. This skill gives the agent a repeatable, auditable procedure so that
every run produces the same structured analysis regardless of who invokes it. It is an
**analysis and decision-support** skill: it gathers evidence, reasons over it explicitly,
and reports findings with calibrated uncertainty. It never takes irreversible action on
the user's behalf.

## When to Use

- The user wants a neutral read on a prediction market's odds and liquidity.
- The user asks to summarize the bull/bear case for a market outcome.
- The user wants manual decision notes — never an automated bet.

Do **not** use this skill for casual chit-chat or when the user explicitly wants a single
unstructured answer — fall back to normal conversation in those cases.

## Required Inputs

- `market` — **required**. Market slug, question, or URL.
- `horizon` — optional. Time window of interest.

If a required input is missing, ask one concise clarifying question before proceeding.
Never invent a value to fill a gap.

## Required Tools

- `market_search`
- `get_market_odds`
- `market_intelligence`

If a listed tool is unavailable in the current agent runtime, continue with the tools you
have, clearly label any section that could not be completed, and lower your confidence
accordingly.

## Workflow

1. **Parse the request.** Extract the primary subject and any optional parameters. Echo
   back your understanding in one line before doing work.
2. **Gather evidence.** Call the required tools to collect raw data. Record the source of
   every material fact so it can be cited in the output.
3. **Normalize.** Convert raw tool output into a consistent internal representation
   (entities, metrics, timestamps). Note anything that looks malformed.
4. **Analyze.** Apply the domain checks relevant to "prediction-markets". Look for the
   risk patterns enumerated in `references/examples.md`.
5. **Score and flag.** Produce explicit risk flags. Each flag must cite the evidence that
   triggered it. Distinguish confirmed issues from suspicions.
6. **Compose the answer** strictly in the Output Format below.
7. **Self-check** against the Verification section before returning.

## Safety Rules

- Never ask for, store, or transmit private keys, seed phrases, or mnemonics.
- Never sign transactions, place orders, or move funds.
- Never guarantee profit or financial outcomes.
- Never fabricate data — if a value is unavailable, say so explicitly.
- Always separate verified facts from assumptions and estimates.
- If a request would require a risky or irreversible action, refuse and explain why.
- No auto-bet, no order placement, no fund movement — manual confirmation only.

## Output Format

Return a single structured response containing exactly these fields:

- `summary` — plain-language overview of the result.
- `odds_snapshot` — current odds / liquidity at time of analysis, timestamped.
- `risk_flags` — explicit risks, severity-tagged, each citing its trigger.
- `decision_notes` — manual options for the user — no automated action.
- `uncertainty` — what was missing or could change the verdict.

Use clear headings or a JSON object — but always include every field above. If a field is
not applicable, return it with an explicit "n/a" rather than omitting it.

## Edge Cases

- **Missing data:** state which inputs/tools were unavailable and how that limits the verdict.
- **Conflicting sources:** present both, explain the conflict, and lower confidence.
- **Ambiguous request:** ask exactly one clarifying question, then proceed with stated assumptions.
- **Risky request:** if fulfilling the request would require a prohibited action (see Safety
  Rules), refuse that part and offer the safe analysis-only alternative.
- **Stale data:** if the freshest data you can reach is old, say so and timestamp it.

## Install Verification

When the user asks to verify this skill, return a compact report containing:

- skill name: `polymarket-market-watcher`
- version: `1.0.0`
- capabilities: a one-line summary of what this skill does
- required tools: the list above
- status: `installed`
- verification code: echo back the exact code the user provided, if any

This lets the marketplace confirm the skill is genuinely installed and addressable before
marking it Working.
