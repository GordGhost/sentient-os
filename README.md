<div align="center">

# SENTIENT//OS

### AI Agent Skill Marketplace & Builder

Turn a one-line prompt into a complete, installable agent **skill package** —
authored, safety-reviewed, validated, published to GitHub, and verifiable in the wild.

[Features](#features) · [How it works](#how-it-works) · [Quick start](#quick-start) · [Architecture](docs/ARCHITECTURE.md) · [Skill spec](docs/SKILL_SPEC.md) · [Roadmap](docs/ROADMAP.md)

![status](https://img.shields.io/badge/status-active-00ff6a)
![next](https://img.shields.io/badge/Next.js-14-000)
![typescript](https://img.shields.io/badge/TypeScript-5-3178c6)
![license](https://img.shields.io/badge/license-MIT-00e5ff)

</div>

---

## What is this?

**SENTIENT//OS** is two things in one product:

1. **A skill *builder*** — describe a capability in plain language and the forge generates a full,
   SOP-grade `SKILL.md` plus `manifest.json`, `test.json`, and `references/examples.md`. Not a short
   prompt — a serious, structured agent instruction pack in the style of the
   [BankrBot skills](https://docs.bankr.bot/skills/overview) format.

2. **A skill *marketplace*** — every published skill becomes a real folder in a GitHub repository, so
   any agent (Bankr, Claude Code, OpenClaw, Cursor, …) can install it with a single command. The
   marketplace can then **verify** a skill is genuinely installed *and* functional before it earns a
   "Working" badge.

The landing site is preserved verbatim; the application lives under `/app`.

## Features

- **Prompt → package.** One line in, a complete validated skill package out.
- **Safety engine.** Malicious requests (phishing, wallet draining, malware, paywall bypass) are
  **blocked**. High-risk execution intents (auto-bet, sniping, transaction signing) are **rewritten
  into analysis-only** skills and flagged for manual review. _It never ships an auto-execution skill._
- **Validation gate.** Frontmatter, required sections, tool declarations, and "no private keys / no
  dangerous instructions" are checked before anything can publish.
- **Real GitHub publishing.** Publishes via **pull request** (never a direct commit to `main`) so an
  admin reviews first. Creates `/<slug>/SKILL.md`, `manifest.json`, `test.json`, `references/examples.md`.
- **Install verification.** A unique `ZAPP-VERIFY-XXXXX` handshake proves a skill is installed, then a
  function test confirms it returns the required output fields.
- **Marketplace.** Search, category / agent / status filters, health badges, per-skill detail pages
  with copyable install commands.
- **Creator + admin dashboards.** Drafts, submissions, published, rejected, archived; plus an admin
  review queue.

## How it works

```
1. You type a short idea            →  "analyze a token for scam signals"
2. The forge authors a real SKILL.md →  + manifest.json + test.json + references
3. Safety + validation run           →  blocked / analysis-only / safe · passed / failed
4. You preview and review            →  tabbed code panels
5. Publish to GitHub                  →  opens a pull request in your skills repo
6. Others install + verify            →  install handshake → function test → Working
```

See [`examples/skills-repo/`](examples/skills-repo/) for two **real generated** skill packages.

## Tech stack

| Layer | Choice |
|------|--------|
| Framework | Next.js 14 (App Router) + React 18 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS (design tokens shared with the landing page) |
| Generation | Deterministic template author + optional Claude (Anthropic) |
| Persistence | Supabase (Postgres) — schema in [`supabase/schema.sql`](supabase/schema.sql) |
| Publishing | GitHub REST (pull-request flow, no SDK dependency) |

> The app runs fully in **mock mode** with zero external services. Add credentials to go live —
> see [Going live](#going-live).

## Quick start

```bash
# 1. install
npm install

# 2. (optional) configure backends — copy and fill
cp .env.example .env.local

# 3. run
npm run dev
# landing → http://localhost:3000/
# app     → http://localhost:3000/app
```

Requires Node.js 18.18+.

## Configuration

All integrations are optional. With no `.env.local`, the app uses the deterministic generator and an
in-memory mock store.

| Variable | Purpose | Without it |
|---|---|---|
| `GITHUB_TOKEN` / `GITHUB_OWNER` / `GITHUB_REPO` / `GITHUB_BRANCH` | Publish skills to your repo via PR | "Publish" is simulated |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | Author `SKILL.md` with Claude | Deterministic template generator |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Persist skills, installs, reviews | In-memory mock store |

## Going live

1. **GitHub publishing** — create a repo (with an initial commit), a fine-grained token with
   *Contents: write* + *Pull requests: write*, set the `GITHUB_*` vars, restart. Publishing now opens
   real pull requests.
2. **Supabase** — create a project, run [`supabase/schema.sql`](supabase/schema.sql), set the
   `*_SUPABASE_*` vars, and implement the query bodies in [`src/lib/store.ts`](src/lib/store.ts).
3. **Claude** — set `ANTHROPIC_API_KEY`; generation switches to the model and re-validates its output.

## Project structure

```
.
├─ public/landing.html        # the marketing site (served at /)
├─ supabase/schema.sql        # Postgres schema (skills, versions, installs, reviews)
├─ examples/skills-repo/      # real generated skill packages (sample output)
├─ docs/                      # architecture, skill spec, roadmap
└─ src/
   ├─ app/                    # routes: /app, /app/create, /marketplace, /skill/[slug], …
   │  └─ actions.ts           # server actions (generate, publish, review)
   ├─ components/             # ui primitives + app components
   └─ lib/
      ├─ skill/               # generator · safety · validation · verify
      ├─ github/publish.ts    # PR-based publishing
      ├─ llm/generate.ts      # Claude authoring (+ deterministic fallback)
      ├─ store.ts             # data access (mock ↔ Supabase)
      └─ types.ts             # domain model (mirrors the schema)
```

## Safety model

This is the core differentiator and is enforced **server-side** — it cannot be skipped from the UI.

- **Blocked** → generation refuses (phishing, draining, malware, credential theft, paywall bypass).
- **Needs manual review** → high-risk execution intent rewritten to analysis-only; publish locked
  until an admin approves.
- **Safe** → standard analysis/research skills.

Details in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [src/lib/skill/safety.ts](src/lib/skill/safety.ts).

## Roadmap

Headline: integrate **Bankr x402 Cloud** so skills can be monetized and discovered by paying agents.
See [docs/ROADMAP.md](docs/ROADMAP.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security policy: [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © SENTIENT//OS
