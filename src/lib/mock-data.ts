import type { Skill } from "./types";
import { buildInstallCommand, githubPathFor } from "./env";

// In-memory demo data. When Supabase env vars are present, lib/store.ts reads
// from Postgres instead; this is the zero-config fallback that makes every page
// render with realistic content.

const now = Date.now();
const iso = (daysAgo: number) => new Date(now - daysAgo * 86400000).toISOString();

function mk(p: Partial<Skill> & Pick<Skill, "slug" | "name" | "description" | "category">): Skill {
  return {
    id: p.slug,
    creator_id: p.creator_id || "u_demo",
    creator_name: p.creator_name || "GordGhost",
    tags: p.tags || [],
    status: p.status || "published",
    visibility: p.visibility || "public",
    compatible_agents: p.compatible_agents || ["bankr", "claude-code"],
    required_tools: p.required_tools || [],
    github_repo: p.github_repo ?? "MY_SKILLS_REPO",
    github_branch: "main",
    github_pr_url: p.github_pr_url ?? null,
    github_path: p.github_path ?? githubPathFor(p.slug),
    install_command: p.install_command ?? buildInstallCommand(p.slug),
    install_count: p.install_count ?? 0,
    last_verified_at: p.last_verified_at ?? null,
    created_at: p.created_at ?? iso(20),
    updated_at: p.updated_at ?? iso(2),
    version: p.version || "1.0.0",
    validation_status: p.validation_status || "passed",
    safety_status: p.safety_status || "safe",
    ...p,
  } as Skill;
}

export const MOCK_SKILLS: Skill[] = [
  mk({
    slug: "token-scam-analyzer",
    name: "Token Scam Analyzer",
    description:
      "Analyze token risk, scam signals, deployer behaviour, holder patterns, and suspicious launch activity.",
    category: "crypto",
    tags: ["crypto", "token", "scam", "risk-analysis"],
    compatible_agents: ["bankr", "claude-code", "openclaw"],
    required_tools: ["token_search", "get_token_launch_info", "read_contract", "market_intelligence"],
    install_count: 1284,
    last_verified_at: iso(1),
    version: "1.2.0",
  }),
  mk({
    slug: "polymarket-market-watcher",
    name: "Polymarket Market Watcher",
    description:
      "Analyze Polymarket markets, summarize odds and liquidity, flag risk, and create manual decision notes. No auto-bet.",
    category: "prediction-markets",
    tags: ["prediction-markets", "odds", "risk-analysis"],
    compatible_agents: ["bankr", "claude-code"],
    required_tools: ["market_search", "get_market_odds", "market_intelligence"],
    install_count: 642,
    last_verified_at: iso(3),
    safety_status: "needs_manual_review",
    status: "published",
  }),
  mk({
    slug: "wallet-pnl-tracker",
    name: "Wallet Pnl Tracker",
    description:
      "Summarize a wallet's realized/unrealized PnL, top positions, and risk exposure. Read-only.",
    category: "crypto",
    tags: ["crypto", "portfolio", "analysis"],
    required_tools: ["wallet_balances", "price_feed", "market_intelligence"],
    install_count: 311,
    last_verified_at: iso(120),
    version: "1.0.0",
  }),
  mk({
    slug: "airdrop-eligibility-scout",
    name: "Airdrop Eligibility Scout",
    description:
      "Check on-chain activity against published airdrop criteria and produce an eligibility checklist.",
    category: "research",
    tags: ["crypto", "airdrop", "research"],
    required_tools: ["wallet_activity", "web_search"],
    install_count: 188,
    last_verified_at: iso(8),
  }),
  mk({
    slug: "contract-audit-summarizer",
    name: "Contract Audit Summarizer",
    description:
      "Read a verified contract and summarize permissions, owner powers, and red flags in plain language.",
    category: "crypto",
    tags: ["crypto", "security", "smart-contract"],
    required_tools: ["read_contract", "web_search"],
    install_count: 97,
    status: "pending_review",
    validation_status: "passed",
    last_verified_at: null,
  }),
  mk({
    slug: "news-signal-digest",
    name: "News Signal Digest",
    description:
      "Monitor a topic across sources and return a structured briefing with findings, risks, and uncertainty.",
    category: "research",
    tags: ["research", "monitoring", "news"],
    required_tools: ["web_search", "fetch_url"],
    install_count: 0,
    status: "draft",
    validation_status: "pending",
    last_verified_at: null,
  }),
];

// Quick lookup used by detail pages.
export function findMockSkill(slug: string): Skill | undefined {
  return MOCK_SKILLS.find((s) => s.slug === slug);
}
