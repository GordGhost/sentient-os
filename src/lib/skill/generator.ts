import type {
  AgentType,
  GenerateInput,
  GeneratedSkill,
  SkillManifest,
  SkillTest,
  Visibility,
} from "../types";
import { slugify, titleCaseFromSlug, newVerificationCode, AGENT_LABELS } from "../utils";
import { assessPrompt, baseSafetyRules } from "./safety";
import { validateSkillMd } from "./validation";
import { buildInstallCommand } from "../env";

// ════════════════════════════════════════════════════════════════════════════
// Deterministic, dependency-free skill author. Produces a long, structured
// SKILL.md (BankrBot-style) plus manifest.json, test.json and references.
// When an LLM is configured, lib/llm/generate.ts uses this as the schema target
// and safety fallback. Output here is intentionally verbose and "SOP-grade".
// ════════════════════════════════════════════════════════════════════════════

interface CategoryProfile {
  category: string;
  tags: string[];
  tools: string[];
  whenToUse: string[];
  inputs: { name: string; required: boolean; note: string }[];
  outputFields: string[];
}

function profileFor(prompt: string, override?: string): CategoryProfile {
  const p = prompt.toLowerCase();
  const has = (...k: string[]) => k.some((x) => p.includes(x));

  if (override === "crypto" || has("token", "scam", "rug", "contract", "deployer", "holder", "onchain", "on-chain")) {
    return {
      category: "crypto",
      tags: ["crypto", "token", "risk-analysis", "onchain"],
      tools: ["token_search", "get_token_launch_info", "read_contract", "market_intelligence"],
      whenToUse: [
        "The user pastes a token address, ticker, or launch link and asks whether it is safe.",
        "The user wants a risk read on deployer behaviour, holder distribution, or launch mechanics.",
        "The user asks to compare a token against known scam patterns before interacting with it.",
      ],
      inputs: [
        { name: "token", required: true, note: "Contract address, ticker, or launch URL." },
        { name: "chain", required: false, note: "Network (defaults to Base if omitted)." },
      ],
      outputFields: ["summary", "findings", "risk_flags", "final_verdict", "uncertainty"],
    };
  }

  if (override === "prediction-markets" || has("polymarket", "odds", "prediction", "market watcher", "betting")) {
    return {
      category: "prediction-markets",
      tags: ["prediction-markets", "odds", "risk-analysis", "research"],
      tools: ["market_search", "get_market_odds", "market_intelligence"],
      whenToUse: [
        "The user wants a neutral read on a prediction market's odds and liquidity.",
        "The user asks to summarize the bull/bear case for a market outcome.",
        "The user wants manual decision notes — never an automated bet.",
      ],
      inputs: [
        { name: "market", required: true, note: "Market slug, question, or URL." },
        { name: "horizon", required: false, note: "Time window of interest." },
      ],
      outputFields: ["summary", "odds_snapshot", "risk_flags", "decision_notes", "uncertainty"],
    };
  }

  if (override === "research" || has("research", "summar", "report", "analyze", "analysis", "monitor", "watch")) {
    return {
      category: "research",
      tags: ["research", "analysis", "monitoring"],
      tools: ["web_search", "fetch_url", "market_intelligence"],
      whenToUse: [
        "The user asks for a structured briefing or monitoring summary on a topic.",
        "The user wants signals and risks surfaced from multiple sources.",
      ],
      inputs: [
        { name: "topic", required: true, note: "Subject, entity, or question to research." },
        { name: "sources", required: false, note: "Optional preferred sources or constraints." },
      ],
      outputFields: ["summary", "findings", "risk_flags", "final_verdict", "uncertainty"],
    };
  }

  // generic fallback
  return {
    category: override || "general",
    tags: ["agent", "automation", "analysis"],
    tools: [],
    whenToUse: [
      "The user's request matches the purpose described below.",
      "The agent needs a repeatable procedure rather than an ad-hoc answer.",
    ],
    inputs: [{ name: "request", required: true, note: "The user's task description." }],
    outputFields: ["summary", "findings", "result", "uncertainty"],
  };
}

export function generateSkill(input: GenerateInput): GeneratedSkill {
  const safety = assessPrompt(input.prompt);
  const verificationCode = newVerificationCode();

  // Hard block — refuse and return an empty-ish bundle carrying the reason.
  if (safety.status === "blocked") {
    return {
      name: "",
      slug: "",
      description: "",
      category: "blocked",
      tags: [],
      compatible_agents: [],
      required_tools: [],
      visibility: "private",
      version: "1.0.0",
      skillMd: "",
      manifest: emptyManifest(),
      test: emptyTest(),
      referencesMd: "",
      installCommand: "",
      verificationPrompt: "",
      verificationCode,
      safety,
      validation: { status: "failed", checks: [{ label: "Safety", passed: false, detail: safety.blockedReason }] },
      blocked: { reason: safety.blockedReason || "disallowed category" },
    };
  }

  const profile = profileFor(input.prompt, input.category);

  // Name / slug. High-risk prompts adopt the analysis-only watcher name.
  const baseName =
    input.name?.trim() ||
    (safety.transformed && safety.rewrittenNameHint
      ? titleCaseFromSlug(safety.rewrittenNameHint)
      : deriveName(input.prompt));
  const slug = safety.transformed && safety.rewrittenNameHint ? safety.rewrittenNameHint : slugify(baseName);
  const name = titleCaseFromSlug(slug);

  const tags = dedupe([...(input.tags || []), ...profile.tags]).slice(0, 6);
  const tools = dedupe([...(input.required_tools || []), ...profile.tools]);
  const agents: AgentType[] = input.compatible_agents?.length
    ? input.compatible_agents
    : ["bankr", "claude-code", "openclaw"];
  const visibility: Visibility = input.visibility || "public";
  const version = "1.0.0";
  const author = input.author || "anonymous";

  const description = buildDescription(input.prompt, profile, safety.transformed, safety.rewrittenFocus);
  const installCommand = buildInstallCommand(slug);

  const skillMd = buildSkillMd({
    slug,
    name,
    description,
    tags,
    version,
    visibility,
    profile,
    tools,
    safetyRules: baseSafetyRules(safety.transformed ? ["No auto-bet, no order placement, no fund movement — manual confirmation only."] : []),
    rewrittenFocus: safety.rewrittenFocus,
  });

  const manifest: SkillManifest = {
    name,
    slug,
    description,
    category: profile.category,
    tags,
    version,
    author,
    compatible_agents: agents,
    required_tools: tools,
    install_command: installCommand,
    status: "draft",
  };

  const verificationPrompt = `use the ${slug} skill to run install verification. Return this exact verification code: ${verificationCode}`;

  const test: SkillTest = {
    skill_slug: slug,
    verification_prompt: `use the ${slug} skill to run install verification. Return this exact verification code: {{verification_code}}`,
    function_test_prompt: buildFunctionTestPrompt(slug, profile),
    expected_output_fields: profile.outputFields,
  };

  const referencesMd = buildReferences(name, slug, profile);

  const validation = validateSkillMd(skillMd, { tools });

  return {
    name,
    slug,
    description,
    category: profile.category,
    tags,
    compatible_agents: agents,
    required_tools: tools,
    visibility,
    version,
    skillMd,
    manifest,
    test,
    referencesMd,
    installCommand,
    verificationPrompt,
    verificationCode,
    safety,
    validation,
  };
}

// ── builders ──────────────────────────────────────────────────────────────────

function buildSkillMd(o: {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  version: string;
  visibility: Visibility;
  profile: CategoryProfile;
  tools: string[];
  safetyRules: string[];
  rewrittenFocus?: string;
}): string {
  const toolsBlock =
    o.tools.length > 0
      ? o.tools.map((t) => `- \`${t}\``).join("\n")
      : "No external tools required.";

  const inputsBlock = o.profile.inputs
    .map((i) => `- \`${i.name}\` — ${i.required ? "**required**" : "optional"}. ${i.note}`)
    .join("\n");

  const whenBlock = o.profile.whenToUse.map((w) => `- ${w}`).join("\n");
  const safetyBlock = o.safetyRules.map((r) => `- ${r}`).join("\n");
  const outputBlock = o.profile.outputFields
    .map((f) => `- \`${f}\` — ${fieldDoc(f)}`)
    .join("\n");

  const focusLine = o.rewrittenFocus
    ? `\n> **Scope guard:** ${o.rewrittenFocus}\n`
    : "";

  return `---
name: ${o.slug}
description: ${o.description}
tags: [${o.tags.join(", ")}]
version: ${o.version}
visibility: ${o.visibility}
---

# ${o.name}
${focusLine}
## Purpose

${o.description} This skill gives the agent a repeatable, auditable procedure so that
every run produces the same structured analysis regardless of who invokes it. It is an
**analysis and decision-support** skill: it gathers evidence, reasons over it explicitly,
and reports findings with calibrated uncertainty. It never takes irreversible action on
the user's behalf.

## When to Use

${whenBlock}

Do **not** use this skill for casual chit-chat or when the user explicitly wants a single
unstructured answer — fall back to normal conversation in those cases.

## Required Inputs

${inputsBlock}

If a required input is missing, ask one concise clarifying question before proceeding.
Never invent a value to fill a gap.

## Required Tools

${toolsBlock}

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
4. **Analyze.** Apply the domain checks relevant to "${o.profile.category}". Look for the
   risk patterns enumerated in \`references/examples.md\`.
5. **Score and flag.** Produce explicit risk flags. Each flag must cite the evidence that
   triggered it. Distinguish confirmed issues from suspicions.
6. **Compose the answer** strictly in the Output Format below.
7. **Self-check** against the Verification section before returning.

## Safety Rules

${safetyBlock}

## Output Format

Return a single structured response containing exactly these fields:

${outputBlock}

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

- skill name: \`${o.slug}\`
- version: \`${o.version}\`
- capabilities: a one-line summary of what this skill does
- required tools: the list above
- status: \`installed\`
- verification code: echo back the exact code the user provided, if any

This lets the marketplace confirm the skill is genuinely installed and addressable before
marking it Working.
`;
}

function buildReferences(name: string, slug: string, profile: CategoryProfile): string {
  return `# ${name} — Reference & Examples

Supporting material the agent may load while running the \`${slug}\` skill.

## Risk / signal checklist (${profile.category})

${referenceChecklist(profile.category)}

## Worked example

**User:** "${exampleRequest(profile.category)}"

**Agent (using ${slug}):**

\`\`\`
summary:      One-paragraph plain-language read of the subject.
findings:     - Evidence item 1 (source)
              - Evidence item 2 (source)
risk_flags:   - [HIGH] Concrete issue, with the evidence that triggered it
              - [LOW]  Minor concern
final_verdict: A calibrated conclusion — never a profit guarantee.
uncertainty:  What could change this verdict; what data was missing.
\`\`\`

## Notes

- Keep facts and assumptions visibly separated.
- Cite the tool or source behind every material claim.
- Prefer "I could not verify X" over guessing.
`;
}

function buildFunctionTestPrompt(slug: string, profile: CategoryProfile): string {
  return `use the ${slug} skill to ${exampleRequest(profile.category)} Return the full structured output with every required field populated.`;
}

// ── small helpers ───────────────────────────────────────────────────────────

function deriveName(prompt: string): string {
  // Strip common imperative lead-ins, take a few keywords.
  const cleaned = prompt
    .replace(/\b(create|make|build|generate|please|a|an|the|skill|that|about|for|me)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter(Boolean).slice(0, 4).join(" ");
  return words || "Custom Skill";
}

function buildDescription(
  prompt: string,
  profile: CategoryProfile,
  transformed: boolean,
  focus?: string,
): string {
  if (transformed && focus) {
    return `Analyze and monitor the subject, summarize odds/risk/signals, and produce manual decision notes. ${focus}`;
  }
  switch (profile.category) {
    case "crypto":
      return "Analyze token risk, scam signals, deployer behaviour, holder patterns, and suspicious launch activity.";
    case "prediction-markets":
      return "Analyze prediction markets, summarize odds and liquidity, flag risk, and create manual decision notes.";
    case "research":
      return "Research a topic across sources and return a structured briefing with findings, risks, and uncertainty.";
    default:
      return `Structured assistant for: ${prompt.trim().slice(0, 140)}`;
  }
}

function fieldDoc(field: string): string {
  const docs: Record<string, string> = {
    summary: "plain-language overview of the result.",
    findings: "the concrete evidence gathered, each with its source.",
    risk_flags: "explicit risks, severity-tagged, each citing its trigger.",
    final_verdict: "calibrated conclusion (never a profit guarantee).",
    uncertainty: "what was missing or could change the verdict.",
    odds_snapshot: "current odds / liquidity at time of analysis, timestamped.",
    decision_notes: "manual options for the user — no automated action.",
    result: "the primary structured output of the task.",
  };
  return docs[field] || "structured value.";
}

function referenceChecklist(category: string): string {
  if (category === "crypto") {
    return [
      "- Deployer wallet age, funding source, and prior deploys.",
      "- Holder concentration (top-10 %, sniper clusters, fresh-wallet bundles).",
      "- Contract: mint authority, freeze authority, hidden fees, honeypot patterns.",
      "- Liquidity: locked vs unlocked, LP burn, removable liquidity.",
      "- Launch mechanics: stealth vs announced, bot activity, wash trading.",
    ].join("\n");
  }
  if (category === "prediction-markets") {
    return [
      "- Liquidity depth and spread on each outcome.",
      "- Resolution source and ambiguity in the question text.",
      "- Recent odds movement and what news drove it.",
      "- Concentration: is one wallet moving the market?",
    ].join("\n");
  }
  return [
    "- Source credibility and recency.",
    "- Conflicting claims across sources.",
    "- Gaps where no reliable data exists.",
  ].join("\n");
}

function exampleRequest(category: string): string {
  switch (category) {
    case "crypto":
      return "assess the risk of the token at 0xABCD…1234 on Base and tell me if it looks like a scam.";
    case "prediction-markets":
      return "summarize the odds and risk for the 'will X happen by Friday' market and give me manual decision notes.";
    case "research":
      return "give me a briefing on the current state of topic Y with sources.";
    default:
      return "run the documented procedure on the provided input.";
  }
}

function dedupe<T>(xs: T[]): T[] {
  return Array.from(new Set(xs));
}

function emptyManifest(): SkillManifest {
  return {
    name: "",
    slug: "",
    description: "",
    category: "blocked",
    tags: [],
    version: "1.0.0",
    author: "anonymous",
    compatible_agents: [],
    required_tools: [],
    install_command: "",
    status: "draft",
  };
}

function emptyTest(): SkillTest {
  return { skill_slug: "", verification_prompt: "", function_test_prompt: "", expected_output_fields: [] };
}

export { AGENT_LABELS };
