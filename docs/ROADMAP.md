# Roadmap

Status legend: ✅ done · 🟡 in progress · ⬜ planned

## Phase 0 — Forge (✅ shipped in 0.1.0)
- ✅ Deterministic skill generator (SKILL.md + manifest + test + references)
- ✅ Safety engine (block / rewrite-to-analysis-only / pass)
- ✅ Validation gate
- ✅ Install + function verification
- ✅ Marketplace, creator, and admin pages
- ✅ Mock store + Supabase schema

## Phase 1 — Real backends (🟡)
- 🟡 **GitHub publishing** — code complete; needs a repo + token to go live.
- ⬜ **Supabase persistence** — implement the query bodies in `src/lib/store.ts` against the schema.
- ⬜ **Claude authoring** — enable richer SKILL.md generation with `ANTHROPIC_API_KEY`.
- ⬜ Auth (wallet or GitHub OAuth) so `creator_id` / `reviewer_id` are real.

## Phase 2 — Verification network (⬜)
- ⬜ Re-verification cron: periodically re-run install/function tests and flip skills to `outdated`.
- ⬜ Community reviews wired to the `skill_reviews` table.
- ⬜ Version diffs + upgrade prompts (`needs_update`).

## Phase 3 — Merge with the Bankr ecosystem (⬜)
The headline goal: let agents **discover, install, and pay for** SentientOS skills autonomously by
plugging into Bankr's marketplace + payment rails.

- ⬜ Publish/sync skills to **skills.bankr.bot** ("plug-and-play tools for agents") so they appear in
  Bankr's public catalog alongside the GitHub repo.
- ⬜ Wrap selected skills as **x402 paid endpoints** (deploy via the Bankr CLI).
- ⬜ Map a published skill → an x402 service entry (price, schema, install command).
- ⬜ Surface earnings + install/usage telemetry in the creator dashboard.
- ⬜ Index skills in x402 discovery so paying agents can find them.

References:
- Bankr x402 Cloud — https://docs.bankr.bot/x402-cloud/overview
- Bankr Skills marketplace — https://skills.bankr.bot

## Nice-to-haves (⬜)
- ⬜ CLI: `sentient skill new "<idea>"` to generate a package locally.
- ⬜ One-click "open in agent" deep links per compatible agent.
- ⬜ Public skill pages with shareable cards.
