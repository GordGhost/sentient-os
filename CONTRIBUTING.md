# Contributing to SENTIENT//OS

Thanks for your interest. This guide keeps contributions consistent and safe.

## Development setup

```bash
npm install
cp .env.example .env.local   # optional — app runs without it
npm run dev
```

- Node.js **18.18+** (see [`.nvmrc`](.nvmrc)).
- The app runs in mock mode with no credentials, so you can develop the full UI offline.

## Before you open a PR

```bash
npx tsc --noEmit     # types must pass
npm run build        # production build must succeed
npm run lint         # next lint
```

CI runs the same checks (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Code conventions

- **TypeScript strict** everywhere. No `any` without a comment explaining why.
- Match the existing design system — Tailwind tokens (`green`, `cyan`, `panel`, `line-bright`, …),
  `font-mono` / `font-grot`, the terminal/HUD aesthetic. Do not introduce a new visual language.
- Keep secrets server-side. Anything reading `process.env` lives in a server component, server action,
  or a `server-only` module — never in a `"use client"` file.
- Pure logic (generation, safety, validation, verification) stays in `src/lib/skill/*` and must be
  unit-testable without a browser or network.

## The safety policy is not optional

Any change to `src/lib/skill/safety.ts` or `validation.ts` must:

- keep **blocked** categories blocked (phishing, draining, malware, credential theft, paywall bypass);
- keep high-risk execution intents **rewritten to analysis-only** and flagged `needs_manual_review`;
- never weaken the "no private keys / no fund movement / no order placement" guarantees.

If you add a capability that could execute, move funds, or sign — stop and open an issue first.

## Commit / PR

- Small, focused PRs. Describe **what** and **why**.
- Reference any issue it closes.
- Screenshots/GIFs for UI changes are appreciated.
