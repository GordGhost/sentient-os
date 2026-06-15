import Link from "next/link";
import type { Skill } from "@/lib/types";
import { Card } from "@/components/ui/primitives";
import { Badge, MarketStatusBadge } from "@/components/ui/Badge";
import { AGENT_LABELS, marketBadge, relativeTime } from "@/lib/utils";

export function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Link href={`/app/skill/${skill.slug}`} className="block">
      <Card interactive className="h-full">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">
              {skill.category}
            </div>
            <h3 className="mt-1.5 truncate font-grot text-lg font-semibold text-[#eaf5ee]">
              {skill.name}
            </h3>
          </div>
          <MarketStatusBadge status={marketBadge(skill)} />
        </div>

        <p className="mt-3 line-clamp-2 font-mono text-[11.5px] leading-relaxed text-dim">
          {skill.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {skill.compatible_agents.slice(0, 3).map((a) => (
            <Badge key={a} tone="dim">{AGENT_LABELS[a]}</Badge>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-dim">
          <span>@{skill.creator_name}</span>
          <span className="flex items-center gap-3">
            <span className="text-green">v{skill.version}</span>
            <span>{skill.install_count.toLocaleString()} inst</span>
          </span>
        </div>
        <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-dim/60">
          verified {relativeTime(skill.last_verified_at)}
        </div>
      </Card>
    </Link>
  );
}
