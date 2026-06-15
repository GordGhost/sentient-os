import { notFound } from "next/navigation";
import Link from "next/link";
import { getSkill } from "@/lib/store";
import { generateSkill } from "@/lib/skill/generator";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/primitives";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tabs } from "@/components/ui/Tabs";
import { Badge, MarketStatusBadge, SafetyBadge, ValidationBadge } from "@/components/ui/Badge";
import { AGENT_LABELS, marketBadge, relativeTime } from "@/lib/utils";
import { githubPathFor } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function SkillDetailPage({ params }: { params: { slug: string } }) {
  const skill = await getSkill(params.slug);
  if (!skill) notFound();

  // Reconstruct the package contents deterministically from the skill's metadata
  // so SKILL.md / manifest / test previews are consistent. (Supabase: read the
  // stored skill_versions row instead.)
  const bundle = generateSkill({
    prompt: skill.description,
    name: skill.name,
    category: skill.category,
    tags: skill.tags,
    required_tools: skill.required_tools,
    compatible_agents: skill.compatible_agents,
    visibility: skill.visibility,
    author: skill.creator_name,
  });

  const githubUrl = skill.github_path || githubPathFor(skill.slug);
  const fnTest = `use the ${skill.slug} skill to run its documented procedure on a sample input and return the full structured output.`;

  return (
    <div>
      <PageHeader
        code="02 // Skill"
        title={skill.name}
        subtitle={skill.description}
        action={
          <Link href="/app/marketplace" className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim hover:text-green">
            ← marketplace
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* main */}
        <div className="min-w-0 space-y-6">
          {/* install */}
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <span className="mono-label">Install command</span>
              <CopyButton value={skill.install_command} label="Copy install" />
            </div>
            <code className="block break-all font-mono text-[12px] leading-relaxed text-green">
              {skill.install_command}
            </code>
            <div className="mt-3 flex items-center gap-3 border-t border-line pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">
              <span>github path:</span>
              <a href={githubUrl} className="truncate text-cyan hover:underline" target="_blank" rel="noreferrer">
                /{skill.slug}
              </a>
            </div>
          </Card>

          {/* package previews */}
          <Tabs
            items={[
              { id: "skill", label: "SKILL.md", content: <CodeBlock title="SKILL.md" content={bundle.skillMd} /> },
              { id: "manifest", label: "manifest.json", content: <CodeBlock title="manifest.json" content={JSON.stringify(bundle.manifest, null, 2)} /> },
              { id: "test", label: "test.json", content: <CodeBlock title="test.json" content={JSON.stringify(bundle.test, null, 2)} /> },
            ]}
          />

          {/* verification */}
          <Card>
            <span className="mono-label">Verification</span>
            <div className="mt-4 space-y-4">
              <PromptRow label="Install verification prompt" value={bundle.test.verification_prompt} />
              <PromptRow label="Function test prompt" value={fnTest} />
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <span className="mono-label">Last test result</span>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <MarketStatusBadge status={marketBadge(skill)} />
                <span className="font-mono text-[11px] text-dim">
                  verified {relativeTime(skill.last_verified_at)}
                </span>
                <Link
                  href="/app/verify"
                  className="ml-auto border border-line-bright px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-dim transition-colors hover:border-green/50 hover:text-green"
                >
                  Run verification →
                </Link>
              </div>
            </div>
          </Card>

          {/* reviews placeholder */}
          <Card>
            <span className="mono-label">User reviews &amp; feedback</span>
            <div className="mt-4 space-y-3">
              {[
                { u: "agent_0x9f", t: "Caught a honeypot my other tools missed. Clear verdict.", r: 5 },
                { u: "node_runner", t: "Solid risk read. Wish it covered more chains.", r: 4 },
              ].map((rev, i) => (
                <div key={i} className="border border-line bg-bg/50 p-3">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-dim">
                    <span>@{rev.u}</span>
                    <span className="text-green">{"★".repeat(rev.r)}<span className="text-line-bright">{"★".repeat(5 - rev.r)}</span></span>
                  </div>
                  <p className="mt-2 font-mono text-[11px] leading-relaxed text-txt">{rev.t}</p>
                </div>
              ))}
              <p className="font-mono text-[10px] text-dim/60">
                {/* TODO(supabase): load real reviews from skill_reviews. */}
                placeholder feed — wire to skill_reviews.
              </p>
            </div>
          </Card>
        </div>

        {/* meta sidebar */}
        <aside className="space-y-4">
          <Card>
            <span className="mono-label">Status</span>
            <div className="mt-3 flex flex-wrap gap-2">
              <MarketStatusBadge status={marketBadge(skill)} />
              <ValidationBadge status={skill.validation_status} />
              <SafetyBadge status={skill.safety_status} />
            </div>
          </Card>
          <Card>
            <dl className="space-y-3 font-mono text-[11px]">
              <Meta k="Creator" v={`@${skill.creator_name}`} />
              <Meta k="Version" v={`v${skill.version}`} accent />
              <Meta k="Category" v={skill.category} />
              <Meta k="Installs" v={skill.install_count.toLocaleString()} />
              <Meta k="Visibility" v={skill.visibility} />
              <Meta k="Created" v={relativeTime(skill.created_at)} />
            </dl>
          </Card>
          <Card>
            <span className="mono-label">Compatible agents</span>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skill.compatible_agents.map((a) => (
                <Badge key={a} tone="cyan">{AGENT_LABELS[a]}</Badge>
              ))}
            </div>
          </Card>
          <Card>
            <span className="mono-label">Required tools</span>
            <div className="mt-3 flex flex-col gap-1.5">
              {skill.required_tools.length ? (
                skill.required_tools.map((t) => (
                  <code key={t} className="font-mono text-[11px] text-green">▸ {t}</code>
                ))
              ) : (
                <span className="font-mono text-[11px] text-dim">No external tools required.</span>
              )}
            </div>
          </Card>
          <Card>
            <span className="mono-label">Tags</span>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skill.tags.map((t) => (
                <Badge key={t} tone="dim">#{t}</Badge>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function PromptRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-dim">{label}</span>
        <CopyButton value={value} />
      </div>
      <code className="block break-words border border-line-bright bg-bg p-3 font-mono text-[11px] leading-relaxed text-cyan">
        {value}
      </code>
    </div>
  );
}

function Meta({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-dim">{k}</dt>
      <dd className={accent ? "text-green" : "text-txt"}>{v}</dd>
    </div>
  );
}
