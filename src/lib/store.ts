import type { Skill, SkillStatus } from "./types";
import { MOCK_SKILLS, findMockSkill } from "./mock-data";
import { hasSupabase } from "./env";

// ════════════════════════════════════════════════════════════════════════════
// Data access layer. Today it serves the in-memory mock store. When Supabase env
// vars are present, swap these bodies for queries against the schema in
// /supabase/schema.sql — the function signatures are designed to stay identical.
// ════════════════════════════════════════════════════════════════════════════

export async function listSkills(filter?: {
  status?: SkillStatus;
  publishedOnly?: boolean;
}): Promise<Skill[]> {
  if (hasSupabase()) {
    // TODO(supabase): select * from skills with filters + latest version join.
  }
  let rows = [...MOCK_SKILLS];
  if (filter?.status) rows = rows.filter((s) => s.status === filter.status);
  if (filter?.publishedOnly) rows = rows.filter((s) => s.status === "published");
  return rows.sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));
}

export async function getSkill(slug: string): Promise<Skill | null> {
  if (hasSupabase()) {
    // TODO(supabase): select * from skills where slug = $1
  }
  return findMockSkill(slug) ?? null;
}

export async function getDashboardStats(): Promise<{
  total: number;
  published: number;
  pending: number;
  failed: number;
  installs: number;
  latest: Skill[];
}> {
  const all = await listSkills();
  return {
    total: all.length,
    published: all.filter((s) => s.status === "published").length,
    pending: all.filter((s) => s.status === "pending_review").length,
    failed: all.filter((s) => s.validation_status === "failed").length,
    installs: all.reduce((n, s) => n + s.install_count, 0),
    latest: all.slice(0, 5),
  };
}

export async function getMySkills(): Promise<Record<SkillStatus, Skill[]>> {
  const all = await listSkills();
  const empty: Record<SkillStatus, Skill[]> = {
    draft: [],
    pending_review: [],
    published: [],
    rejected: [],
    archived: [],
  };
  for (const s of all) empty[s.status].push(s);
  return empty;
}
