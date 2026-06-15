import Link from "next/link";
import { getDashboardStats } from "@/lib/store";
import { PageHeader } from "@/components/app/PageHeader";
import { Stat, Card, GhostLink } from "@/components/ui/primitives";
import { SkillStatusBadge, MarketStatusBadge } from "@/components/ui/Badge";
import { marketBadge, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <PageHeader
        code="00 // Overview"
        title="Command Deck"
        subtitle="Generate installable agent skills, validate them, publish to GitHub, and verify they actually work in the wild."
        action={<GhostLink href="/app/create">▸ Create Skill</GhostLink>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat value={stats.total} label="Total skills" />
        <Stat value={stats.published} label="Published" tone="cyan" />
        <Stat value={stats.pending} label="Pending review" tone="amber" />
        <Stat value={stats.failed} label="Failed validation" tone="red" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Stat
          value={stats.installs.toLocaleString()}
          label="Total installs"
          hint="across all published skills"
        />
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <span className="mono-label">Latest generated skills</span>
            <Link href="/app/marketplace" className="font-mono text-[10px] uppercase tracking-[0.15em] text-green hover:text-cyan">
              view marketplace →
            </Link>
          </div>
          <div className="divide-y divide-line">
            {stats.latest.map((s) => (
              <Link
                key={s.id}
                href={`/app/skill/${s.slug}`}
                className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-green/5"
              >
                <div className="min-w-0">
                  <div className="truncate font-grot text-sm font-medium text-[#eaf5ee]">{s.name}</div>
                  <div className="font-mono text-[10px] text-dim">
                    {s.category} · v{s.version} · updated {relativeTime(s.updated_at)}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {s.status === "published" ? (
                    <MarketStatusBadge status={marketBadge(s)} />
                  ) : (
                    <SkillStatusBadge status={s.status} />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <QuickLink href="/app/create" title="Forge a skill" desc="One line in → full SKILL.md package out." />
        <QuickLink href="/app/verify" title="Verify an install" desc="Prove a skill actually works before trusting it." />
        <QuickLink href="/app/admin/review" title="Review queue" desc="Approve or reject submitted skills." />
      </div>
    </div>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href}>
      <Card interactive className="h-full">
        <div className="font-grot text-base font-semibold text-[#eaf5ee]">{title}</div>
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-dim">{desc}</p>
        <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-green">open ▸</div>
      </Card>
    </Link>
  );
}
