"use client";

import { useState } from "react";
import type { Skill } from "@/lib/types";
import { Badge, SafetyBadge, ValidationBadge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { classNames, AGENT_LABELS } from "@/lib/utils";

interface ReviewItem extends Skill {
  skill_md: string;
  safety_notes: string[];
}

export function ReviewQueue({ items }: { items: ReviewItem[] }) {
  const [decisions, setDecisions] = useState<Record<string, "approved" | "rejected">>({});
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  const [flash, setFlash] = useState<string | null>(null);

  function decide(id: string, slug: string, decision: "approved" | "rejected") {
    setDecisions((d) => ({ ...d, [id]: decision }));
    // TODO(server): call an approveSkillAction/rejectSkillAction server action.
    // On approve → publishSkillToGithub() opens a PR (never a direct main commit).
    setFlash(
      decision === "approved"
        ? `Approved ${slug} → opening pull request for publish.`
        : `Rejected ${slug}. Creator notified.`,
    );
  }

  if (items.length === 0) {
    return (
      <div className="panel p-10 text-center font-mono text-[12px] text-dim">
        Review queue is empty. Nothing pending.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flash && (
        <div className="panel border-green/40 bg-green/5 px-4 py-3 font-mono text-[11px] text-green">{flash}</div>
      )}
      {items.map((item) => {
        const decision = decisions[item.id];
        const open = openId === item.id;
        return (
          <div key={item.id} className="panel">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-grot text-base font-semibold text-[#eaf5ee]">{item.name}</span>
                  <code className="font-mono text-[10px] text-dim">{item.slug}</code>
                </div>
                <p className="mt-1 line-clamp-1 font-mono text-[11px] text-dim">{item.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ValidationBadge status={item.validation_status} />
                <SafetyBadge status={item.safety_status} />
                {decision && (
                  <Badge tone={decision === "approved" ? "green" : "red"} dot>{decision}</Badge>
                )}
                <span className="font-mono text-dim">{open ? "−" : "+"}</span>
              </div>
            </button>

            {open && (
              <div className="grid gap-5 border-t border-line-bright p-5 lg:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="mono-label">Generated SKILL.md</span>
                    <CopyButton value={item.skill_md} />
                  </div>
                  <pre className="code-scroll max-h-[360px] overflow-auto border border-line-bright bg-[#02050780] p-3 text-[11px] text-txt">
                    {item.skill_md}
                  </pre>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="mono-label">Safety review</span>
                    <ul className="mt-2 space-y-1.5">
                      {item.safety_notes.map((n, i) => (
                        <li key={i} className="flex gap-2 font-mono text-[11px] leading-relaxed text-txt">
                          <span className="text-amber">▸</span>{n}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="mono-label">Meta</span>
                    <dl className="mt-2 space-y-1 font-mono text-[11px] text-dim">
                      <Row k="category" v={item.category} />
                      <Row k="agents" v={item.compatible_agents.map((a) => AGENT_LABELS[a]).join(", ")} />
                      <Row k="tools" v={item.required_tools.join(", ") || "none"} />
                      <Row k="creator" v={`@${item.creator_name}`} />
                    </dl>
                  </div>

                  <div className="rounded-none border-l-2 border-amber bg-amber/5 px-3 py-2 font-mono text-[10px] leading-relaxed text-amber">
                    On approve, the skill is published via a pull request — never a direct commit to
                    main. Unsafe skills are rejected, not merged.
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => decide(item.id, item.slug, "approved")}
                      disabled={!!decision}
                      className={classNames(
                        "flex-1 border border-green py-3 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors disabled:opacity-40",
                        "bg-green text-black hover:bg-cyan hover:border-cyan",
                      )}
                    >
                      Approve & publish
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(item.id, item.slug, "rejected")}
                      disabled={!!decision}
                      className="flex-1 border border-red py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-red transition-colors hover:bg-red hover:text-black disabled:opacity-40"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 text-dim/60">{k}</dt>
      <dd className="text-txt">{v}</dd>
    </div>
  );
}
