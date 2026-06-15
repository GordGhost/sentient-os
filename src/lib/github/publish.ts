import "server-only";
import type { GeneratedSkill } from "../types";
import { env, hasGithub } from "../env";

// ════════════════════════════════════════════════════════════════════════════
// Publish a generated skill to GitHub. For safety we default to a PULL REQUEST
// against `main` (never a direct commit), so an admin reviews before merge.
//
// Layout created under the repo root:
//   /<slug>/SKILL.md
//   /<slug>/manifest.json
//   /<slug>/test.json
//   /<slug>/references/examples.md
// ════════════════════════════════════════════════════════════════════════════

export interface PublishResult {
  ok: boolean;
  mode: "pull_request" | "direct" | "mock";
  prUrl?: string;
  branch?: string;
  path?: string;
  message: string;
}

interface PublishOptions {
  skill: GeneratedSkill;
  // direct commit to main, or open a PR (default + recommended)
  strategy?: "pull_request" | "direct";
}

const GH = "https://api.github.com";

export async function publishSkillToGithub({
  skill,
  strategy = "pull_request",
}: PublishOptions): Promise<PublishResult> {
  if (!hasGithub()) {
    // Mock-safe path: nothing is written, but the UI gets a realistic shape.
    return {
      ok: true,
      mode: "mock",
      branch: `skill/${skill.slug}`,
      path: `${skill.slug}/`,
      prUrl: `https://github.com/${env.githubOwner}/${env.githubRepo}/pull/0`,
      message:
        "GITHUB_TOKEN not set — simulated publish. Set env vars to open a real pull request.",
    };
  }

  const files: Record<string, string> = {
    [`${skill.slug}/SKILL.md`]: skill.skillMd,
    [`${skill.slug}/manifest.json`]: JSON.stringify(skill.manifest, null, 2),
    [`${skill.slug}/test.json`]: JSON.stringify(skill.test, null, 2),
    [`${skill.slug}/references/examples.md`]: skill.referencesMd,
  };

  try {
    return await doPublish(skill, files, strategy);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Friendly hint for the most common first-time failure.
    const hint = /getRef 404/.test(message)
      ? `Branch '${env.githubBranch}' not found. Create the repo with an initial commit (tick "Add a README") so the branch exists.`
      : /401|403/.test(message)
        ? "GitHub rejected the token (401/403). Check the token has Contents + Pull-requests write access to this repo."
        : message;
    return { ok: false, mode: strategy, path: `${skill.slug}/`, message: `Publish failed: ${hint}` };
  }
}

async function doPublish(
  skill: GeneratedSkill,
  files: Record<string, string>,
  strategy: "pull_request" | "direct",
): Promise<PublishResult> {
  if (strategy === "direct") {
    for (const [path, content] of Object.entries(files)) {
      await putFile(path, content, env.githubBranch, `add ${skill.slug}: ${path}`);
    }
    return {
      ok: true,
      mode: "direct",
      branch: env.githubBranch,
      path: `${skill.slug}/`,
      message: `Committed ${Object.keys(files).length} files to ${env.githubBranch}.`,
    };
  }

  // Pull-request strategy.
  const branch = `skill/${skill.slug}-${Date.now().toString(36)}`;
  const baseSha = await getRefSha(env.githubBranch);
  await createRef(branch, baseSha);
  for (const [path, content] of Object.entries(files)) {
    await putFile(path, content, branch, `add ${skill.slug}: ${path}`);
  }
  const pr = await openPullRequest(
    branch,
    `Add skill: ${skill.name}`,
    prBody(skill),
  );

  return {
    ok: true,
    mode: "pull_request",
    branch,
    path: `${skill.slug}/`,
    prUrl: pr.html_url,
    message: "Opened a pull request for admin review.",
  };
}

// ── GitHub REST helpers (plain fetch, no SDK dependency) ──────────────────────

function gh(path: string, init?: RequestInit) {
  return fetch(`${GH}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${env.githubToken}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      ...(init?.headers || {}),
    },
  });
}

async function getRefSha(branch: string): Promise<string> {
  const r = await gh(`/repos/${env.githubOwner}/${env.githubRepo}/git/ref/heads/${branch}`);
  if (!r.ok) throw new Error(`getRef ${r.status}`);
  const j = (await r.json()) as { object: { sha: string } };
  return j.object.sha;
}

async function createRef(branch: string, sha: string): Promise<void> {
  const r = await gh(`/repos/${env.githubOwner}/${env.githubRepo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha }),
  });
  if (!r.ok && r.status !== 422) throw new Error(`createRef ${r.status}`); // 422 = exists
}

async function putFile(path: string, content: string, branch: string, message: string): Promise<void> {
  // base64 (utf-8 safe)
  const b64 = Buffer.from(content, "utf-8").toString("base64");
  // look up existing sha (needed to update)
  let sha: string | undefined;
  const head = await gh(
    `/repos/${env.githubOwner}/${env.githubRepo}/contents/${encodeURIComponent(path)}?ref=${branch}`,
  );
  if (head.ok) sha = ((await head.json()) as { sha: string }).sha;

  const r = await gh(`/repos/${env.githubOwner}/${env.githubRepo}/contents/${encodeURIComponent(path)}`, {
    method: "PUT",
    body: JSON.stringify({ message, content: b64, branch, sha }),
  });
  if (!r.ok) throw new Error(`putFile ${path} ${r.status}`);
}

async function openPullRequest(branch: string, title: string, body: string) {
  const r = await gh(`/repos/${env.githubOwner}/${env.githubRepo}/pulls`, {
    method: "POST",
    body: JSON.stringify({ title, head: branch, base: env.githubBranch, body }),
  });
  if (!r.ok) throw new Error(`openPR ${r.status}`);
  return (await r.json()) as { html_url: string; number: number };
}

function prBody(skill: GeneratedSkill): string {
  return [
    `**${skill.name}** — \`${skill.slug}\``,
    "",
    skill.description,
    "",
    `- category: ${skill.category}`,
    `- version: ${skill.version}`,
    `- safety: ${skill.safety.status}`,
    `- validation: ${skill.validation.status}`,
    `- install: \`${skill.installCommand}\``,
    "",
    "_Opened automatically by SENTIENT//OS Skill Forge. Review before merging._",
  ].join("\n");
}
