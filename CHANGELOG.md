# Changelog

All notable changes to this project are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/).

## [0.1.0] — 2026-06-15

Initial release of the SENTIENT//OS Skill Forge.

### Added
- **Skill generator** — deterministic, SOP-grade `SKILL.md` + `manifest.json` + `test.json` +
  `references/examples.md` from a one-line prompt.
- **Safety engine** — blocks malicious categories; rewrites high-risk execution intents into
  analysis-only skills flagged for manual review.
- **Validation** — frontmatter, required sections, tool declarations, private-key / dangerous-instruction checks.
- **Install verification** — `ZAPP-VERIFY-XXXXX` handshake + function-test field checks.
- **GitHub publishing** — pull-request flow that creates the skill folder in a repo.
- **Pages** — dashboard, create, marketplace, skill detail, my-skills, verify, admin review.
- **Supabase schema** for skills, versions, installs, and reviews.
- Preserved the original landing page, served at `/`.

### Notes
- Ships in mock mode; GitHub, Supabase, and Claude are optional integrations.
