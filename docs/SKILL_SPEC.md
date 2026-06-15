# Skill Package Specification

Every published skill is a folder named after its slug:

```
<slug>/
├─ SKILL.md            # the instruction pack (YAML frontmatter + markdown body)
├─ manifest.json       # machine-readable metadata + install command
├─ test.json           # verification + function-test definition
└─ references/
   └─ examples.md      # checklists and worked examples the agent may load
```

See [`examples/skills-repo/`](../examples/skills-repo/) for two real, generated packages.

## `SKILL.md`

YAML frontmatter followed by a fixed set of sections:

```markdown
---
name: skill-slug
description: Clear one-line description
tags: [tag1, tag2, tag3]
version: 1.0.0
visibility: public
---

# Skill Name

## Purpose
## When to Use
## Required Inputs
## Required Tools          # or "No external tools required."
## Workflow
## Safety Rules
## Output Format
## Edge Cases
## Install Verification
```

The **Safety Rules** section always includes the non-negotiable baseline (no private keys, no signing,
no fund movement, no fabricated data, separate facts from assumptions). The **Install Verification**
section tells the agent to return its name, version, capabilities, tools, `status: installed`, and to
echo any verification code provided.

## `manifest.json`

```json
{
  "name": "Token Scam Analyzer",
  "slug": "token-scam-analyzer",
  "description": "Analyze token risk, scam signals, deployer behaviour, holder patterns, and suspicious launch activity.",
  "category": "crypto",
  "tags": ["crypto", "token", "scam", "risk-analysis"],
  "version": "1.0.0",
  "author": "username",
  "compatible_agents": ["bankr", "claude-code", "openclaw"],
  "required_tools": ["token_search", "get_token_launch_info", "read_contract", "market_intelligence"],
  "install_command": "install the token-scam-analyzer skill from https://github.com/OWNER/REPO/tree/main/token-scam-analyzer",
  "status": "published"
}
```

## `test.json`

```json
{
  "skill_slug": "token-scam-analyzer",
  "verification_prompt": "use the token-scam-analyzer skill to run install verification. Return this exact verification code: {{verification_code}}",
  "function_test_prompt": "use the token-scam-analyzer skill to assess the risk of the token at 0xABCD…1234 on Base…",
  "expected_output_fields": ["summary", "findings", "risk_flags", "final_verdict", "uncertainty"]
}
```

## Install command

```
install the <slug> skill from https://github.com/<owner>/<repo>/tree/<branch>/<slug>
```

## Verification flow

1. The marketplace issues a unique code, e.g. `ZAPP-VERIFY-8F29A`.
2. The user runs the `verification_prompt` (with the code substituted) in their agent and pastes the
   output back. The app checks: code matches, slug present, version present, `status: installed`.
3. On success it runs the `function_test_prompt`; the app checks every `expected_output_fields` entry
   is present. All present → **Working**. Anything missing → **Failed**, with the exact field listed.

## Validation rules (pre-publish)

- valid YAML frontmatter with `name`, `description`, `tags`, semver `version`
- `Required Tools`, `Safety Rules`, `Output Format`, `Install Verification` sections present
- declared tools appear in the body (or "No external tools required.")
- does **not** request private keys / seed phrases
- contains **no** dangerous instructions (draining, phishing, paywall bypass, …)
