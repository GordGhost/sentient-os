import "server-only";
import type { GenerateInput, GeneratedSkill } from "../types";
import { generateSkill } from "../skill/generator";
import { assessPrompt } from "../skill/safety";
import { validateSkillMd } from "../skill/validation";
import { env, hasLLM } from "../env";

// ════════════════════════════════════════════════════════════════════════════
// Skill authoring entrypoint.
//   • LLM present  → ask Claude to write the SKILL.md, then re-run our own
//                    safety + validation passes over its output (trust, verify).
//   • No LLM       → deterministic template generator (lib/skill/generator.ts).
// Either way the safety policy is enforced server-side and cannot be skipped.
// ════════════════════════════════════════════════════════════════════════════

export async function authorSkill(input: GenerateInput): Promise<GeneratedSkill> {
  // Safety gate first — blocked prompts never reach the model.
  const safety = assessPrompt(input.prompt);
  if (safety.status === "blocked") {
    return generateSkill(input); // returns the `blocked` bundle
  }

  if (!hasLLM()) {
    return generateSkill(input);
  }

  try {
    return await authorWithClaude(input);
  } catch (err) {
    // Never fail the request because of the LLM — fall back to the template.
    console.error("[authorSkill] LLM path failed, using template:", err);
    return generateSkill(input);
  }
}

async function authorWithClaude(input: GenerateInput): Promise<GeneratedSkill> {
  // Start from the deterministic bundle so structure/manifest/test are guaranteed,
  // then let the model rewrite the SKILL.md prose for richness.
  const base = generateSkill(input);

  // TODO(llm): wire your real Anthropic call. Plain fetch keeps deps minimal.
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: env.anthropicModel,
      max_tokens: 4000,
      system:
        "You are a senior agent-skill author. Rewrite the given SKILL.md to be longer, " +
        "more specific, and SOP-grade, but KEEP the exact same section headings, the YAML " +
        "frontmatter, and the 'Install Verification' section. Never add instructions that " +
        "request private keys, move funds, sign transactions, or place orders.",
      messages: [
        {
          role: "user",
          content:
            `Short request: ${input.prompt}\n\n` +
            `Here is the baseline SKILL.md to improve (return ONLY the full markdown):\n\n${base.skillMd}`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = (await res.json()) as { content?: { text?: string }[] };
  const md = data.content?.[0]?.text?.trim();
  if (!md || !md.startsWith("---")) throw new Error("model returned non-SKILL output");

  // Re-validate the model's output. If it fails, keep the template version.
  const validation = validateSkillMd(md, { tools: base.required_tools });
  if (validation.status === "failed") return base;

  return { ...base, skillMd: md, validation };
}
