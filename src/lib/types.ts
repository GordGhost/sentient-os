// ════════════════════════════════════════════════════════════════════════════
// Domain types — mirror the Supabase schema in /supabase/schema.sql 1:1 so the
// mock store and a real Postgres backend stay interchangeable.
// ════════════════════════════════════════════════════════════════════════════

export type SkillStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "archived";

export type Visibility = "public" | "private";

export type ValidationStatus = "pending" | "passed" | "failed";

export type SafetyStatus = "safe" | "needs_manual_review" | "blocked";

export type InstallStatus =
  | "not_installed"
  | "install_pending"
  | "installed"
  | "working"
  | "failed"
  | "outdated"
  | "needs_update";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type AgentType = "bankr" | "claude-code" | "openclaw" | "cursor" | "other";

// Marketplace-facing health badge, derived from validation + installs.
export type MarketBadge = "working" | "needs_review" | "failed_test" | "outdated";

export interface Skill {
  id: string;
  creator_id: string;
  creator_name: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  status: SkillStatus;
  visibility: Visibility;
  compatible_agents: AgentType[];
  required_tools: string[];
  github_repo: string | null;
  github_branch: string;
  github_pr_url: string | null;
  github_path: string | null;
  install_command: string;
  install_count: number;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
  // convenience join (latest version snapshot)
  version: string;
  validation_status: ValidationStatus;
  safety_status: SafetyStatus;
}

export interface SkillManifest {
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  author: string;
  compatible_agents: AgentType[];
  required_tools: string[];
  install_command: string;
  status: "draft" | "published";
}

export interface SkillTest {
  skill_slug: string;
  verification_prompt: string;
  function_test_prompt: string;
  expected_output_fields: string[];
}

export interface SkillVersion {
  id: string;
  skill_id: string;
  version: string;
  skill_md: string;
  manifest_json: SkillManifest;
  test_json: SkillTest;
  references_json: { "references/examples.md": string };
  validation_status: ValidationStatus;
  safety_status: SafetyStatus;
  created_at: string;
}

export interface SkillInstall {
  id: string;
  user_id: string;
  skill_id: string;
  skill_version: string;
  install_status: InstallStatus;
  verification_code: string;
  verification_output: string | null;
  function_test_output: string | null;
  agent_type: AgentType | null;
  verified_at: string | null;
  last_checked_at: string | null;
  error_message: string | null;
}

export interface SkillReview {
  id: string;
  skill_id: string;
  reviewer_id: string;
  status: ReviewStatus;
  notes: string;
  created_at: string;
}

// ── Generation pipeline ───────────────────────────────────────────────────────

export interface GenerateInput {
  prompt: string;
  name?: string;
  category?: string;
  tags?: string[];
  compatible_agents?: AgentType[];
  required_tools?: string[];
  visibility?: Visibility;
  author?: string;
}

export interface ValidationResult {
  status: ValidationStatus;
  checks: { label: string; passed: boolean; detail?: string }[];
}

export interface SafetyResult {
  status: SafetyStatus;
  // Human-readable notes about what was transformed or flagged.
  notes: string[];
  // True when the original intent was rewritten into an analysis-only variant.
  transformed: boolean;
}

// The full bundle produced from a single short prompt.
export interface GeneratedSkill {
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  compatible_agents: AgentType[];
  required_tools: string[];
  visibility: Visibility;
  version: string;
  skillMd: string;
  manifest: SkillManifest;
  test: SkillTest;
  referencesMd: string;
  installCommand: string;
  verificationPrompt: string;
  verificationCode: string;
  safety: SafetyResult;
  validation: ValidationResult;
  // present when generation refused (blocked category)
  blocked?: { reason: string };
}
