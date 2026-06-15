// Central env access + capability flags. Importing this never throws, so the app
// runs fully in "mock mode" until you fill in .env.local.

export const env = {
  githubToken: process.env.GITHUB_TOKEN || "",
  githubOwner: process.env.GITHUB_OWNER || "MY_GITHUB_OWNER",
  githubRepo: process.env.GITHUB_REPO || "MY_SKILLS_REPO",
  githubBranch: process.env.GITHUB_BRANCH || "main",
  anthropicKey: process.env.ANTHROPIC_API_KEY || "",
  anthropicModel: process.env.ANTHROPIC_MODEL || "claude-fable-5",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseService: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};

export const hasGithub = () => !!(process.env.GITHUB_TOKEN && env.githubOwner && env.githubRepo);
export const hasLLM = () => !!process.env.ANTHROPIC_API_KEY;
export const hasSupabase = () => !!(env.supabaseUrl && env.supabaseAnon);

// Build the canonical install command for a slug. Uses real owner/repo when set,
// otherwise the visible placeholders so the format is always correct.
export function buildInstallCommand(slug: string): string {
  return `install the ${slug} skill from https://github.com/${env.githubOwner}/${env.githubRepo}/tree/${env.githubBranch}/${slug}`;
}

export function githubPathFor(slug: string): string {
  return `https://github.com/${env.githubOwner}/${env.githubRepo}/tree/${env.githubBranch}/${slug}`;
}
