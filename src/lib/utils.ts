import type { AgentType, MarketBadge, Skill } from "./types";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "");
}

export function titleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function newVerificationCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let body = "";
  for (let i = 0; i < 5; i++) {
    body += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `ZAPP-VERIFY-${body}`;
}

export function relativeTime(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export const AGENT_LABELS: Record<AgentType, string> = {
  bankr: "Bankr",
  "claude-code": "Claude Code",
  openclaw: "OpenClaw",
  cursor: "Cursor",
  other: "Other",
};

// Derive the marketplace health badge from a skill's verification + validation state.
export function marketBadge(skill: Skill): MarketBadge {
  if (skill.validation_status === "failed") return "failed_test";
  if (skill.safety_status === "needs_manual_review") return "needs_review";
  if (skill.status !== "published") return "needs_review";
  if (skill.last_verified_at) {
    const age = Date.now() - new Date(skill.last_verified_at).getTime();
    if (age > 1000 * 60 * 60 * 24 * 90) return "outdated"; // >90d unverified
    return "working";
  }
  return "needs_review";
}

export function classNames(...xs: (string | false | null | undefined)[]): string {
  return xs.filter(Boolean).join(" ");
}
