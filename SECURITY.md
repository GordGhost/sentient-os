# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Instead, report privately via GitHub
Security Advisories ("Report a vulnerability") on this repository, or email the maintainer.

We aim to acknowledge reports within 72 hours.

## Scope of special concern

Because SENTIENT//OS generates agent instructions that may touch crypto and on-chain data, we treat
the following as **high severity**:

- Any path that lets a generated skill request **private keys, seed phrases, or mnemonics**.
- Any path that lets a generated skill **sign transactions, place orders, or move funds**.
- Any bypass of the safety engine that allows a **blocked** category (phishing, draining, malware,
  credential theft, paywall bypass) to be generated or published.
- Leakage of `GITHUB_TOKEN`, `ANTHROPIC_API_KEY`, or the Supabase service-role key to the client.

## Handling secrets

- Secrets live only in `.env.local` (git-ignored) and are read server-side.
- Publishing uses a **pull request** flow so a human reviews before anything reaches `main`.
