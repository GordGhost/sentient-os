"use server";

import type { GenerateInput, GeneratedSkill } from "@/lib/types";
import { authorSkill } from "@/lib/llm/generate";
import { publishSkillToGithub, type PublishResult } from "@/lib/github/publish";

// ════════════════════════════════════════════════════════════════════════════
// Server actions — the seam between the UI and the backend. These run only on
// the server, so secrets (GITHUB_TOKEN, ANTHROPIC_API_KEY) never reach the client.
// ════════════════════════════════════════════════════════════════════════════

export async function generateSkillAction(input: GenerateInput): Promise<GeneratedSkill> {
  return authorSkill(input);
}

export async function publishSkillAction(
  skill: GeneratedSkill,
  strategy: "pull_request" | "direct" = "pull_request",
): Promise<PublishResult> {
  // TODO(supabase): persist skill + version rows, then store prUrl/path back.
  return publishSkillToGithub({ skill, strategy });
}

export async function submitForReviewAction(skill: GeneratedSkill): Promise<{ ok: true; status: "pending_review" }> {
  // TODO(supabase): insert skill with status 'pending_review' + a skill_reviews row.
  return { ok: true, status: "pending_review" };
}

export async function saveDraftAction(skill: GeneratedSkill): Promise<{ ok: true; status: "draft" }> {
  // TODO(supabase): upsert skill with status 'draft'.
  return { ok: true, status: "draft" };
}
