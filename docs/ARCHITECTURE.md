# Architecture

A high-level map of how SENTIENT//OS is put together.

## Overview

```
            ┌────────────────────────── browser ──────────────────────────┐
            │  /landing.html (static)        /app/* (Next App Router)      │
            └───────────────────────────────┬─────────────────────────────┘
                                            │ server actions (src/app/actions.ts)
                       ┌────────────────────┼────────────────────┐
                       ▼                    ▼                    ▼
              authorSkill()         publishSkill…()        store / queries
            (lib/llm/generate)      (lib/github/publish)   (lib/store.ts)
                       │                    │                    │
            ┌──────────┴──────────┐         │             ┌──────┴──────┐
            ▼                     ▼         ▼             ▼             ▼
   deterministic generator  Anthropic   GitHub REST   mock-data   Supabase
   (lib/skill/generator)    (optional)  (PR flow)     (default)   (optional)
            │
   ┌────────┴─────────┬───────────────┐
   ▼                  ▼               ▼
 safety.ts        validation.ts    verify.ts
```

Everything degrades gracefully: with no credentials the app uses the deterministic generator and the
in-memory mock store, so the entire UI is functional offline.

## Request lifecycle: "create a skill"

1. The **CreateSkillForm** (`"use client"`) collects the prompt + options and calls the
   `generateSkillAction` **server action**.
2. `authorSkill()` runs the **safety gate first**. Blocked prompts never reach the model.
3. If `ANTHROPIC_API_KEY` is set, Claude rewrites the baseline `SKILL.md`; the output is then
   **re-validated** server-side. If it fails, the deterministic version is kept. No key → the
   deterministic generator is authoritative.
4. The bundle (skill md, manifest, test, references, install command, verification code, safety +
   validation results) returns to the client and renders in tabbed code panels.
5. **Publish** calls `publishSkillAction`, which opens a **pull request** in the configured repo.

## Modules

| Path | Responsibility |
|---|---|
| `src/lib/skill/generator.ts` | Author the full package from a prompt (deterministic). |
| `src/lib/skill/safety.ts` | Block / rewrite-to-analysis-only / pass. The policy. |
| `src/lib/skill/validation.ts` | Frontmatter + required-section + danger checks. |
| `src/lib/skill/verify.ts` | Install handshake + function-test field checks. |
| `src/lib/llm/generate.ts` | Optional Claude authoring with deterministic fallback. |
| `src/lib/github/publish.ts` | GitHub REST publishing via PR (no SDK). |
| `src/lib/store.ts` | Data access; mock today, Supabase-ready. |
| `src/lib/types.ts` | Domain model — mirrors `supabase/schema.sql`. |
| `src/app/actions.ts` | The server-action seam between UI and backend. |

## Safety pipeline

`assessPrompt()` classifies every prompt:

- **blocked** — matched a disallowed category → generation refuses, nothing is produced.
- **needs_manual_review** — matched a high-risk execution intent → the skill is rewritten into an
  analysis-only "watcher", strict safety rules are injected, and publishing is locked until an admin
  approves.
- **safe** — proceeds normally.

The same baseline safety rules are injected into **every** generated `SKILL.md`, and `validation.ts`
independently re-checks that no skill requests private keys or contains dangerous instructions. The
gate runs in a server action, so it cannot be bypassed from the client.

## Why mock-first

The hard part of this product is the *generation + safety + verification* logic, which is pure and
testable. Keeping the data, LLM, and GitHub layers behind small interfaces (`store.ts`,
`llm/generate.ts`, `github/publish.ts`) means you can build and demo everything before wiring a single
external service, then flip integrations on one at a time via environment variables.
