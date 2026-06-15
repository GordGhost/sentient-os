"use client";

import { useState } from "react";
import Link from "next/link";
import type { Skill, SkillStatus } from "@/lib/types";
import { SkillStatusBadge } from "@/components/ui/Badge";
import { relativeTime, classNames } from "@/lib/utils";

const COLUMNS: { status: SkillStatus; label: string }[] = [
  { status: "draft", label: "Drafts" },
  { status: "pending_review", label: "Pending Review" },
  { status: "published", label: "Published" },
  { status: "rejected", label: "Rejected" },
  { status: "archived", label: "Archived" },
];

// Which actions make sense per status.
function actionsFor(status: SkillStatus): string[] {
  switch (status) {
    case "draft":
      return ["edit", "preview", "submit review", "archive"];
    case "pending_review":
      return ["preview", "archive"];
    case "published":
      return ["preview", "publish to github", "archive"];
    case "rejected":
      return ["edit", "preview", "submit review"];
    case "archived":
      return ["preview"];
    default:
      return ["preview"];
  }
}

export function MySkillsBoard({ grouped }: { grouped: Record<SkillStatus, Skill[]> }) {
  const [flash, setFlash] = useState<string | null>(null);

  return (
    <div>
      {flash && (
        <div className="panel mb-5 border-green/40 bg-green/5 px-4 py-3 font-mono text-[11px] text-green">{flash}</div>
      )}
      <div className="space-y-8">
        {COLUMNS.map((col) => {
          const rows = grouped[col.status] || [];
          return (
            <section key={col.status}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-txt">{col.label}</h2>
                <span className="font-mono text-[10px] text-dim">[{rows.length}]</span>
                <span className="h-px flex-1 bg-line-bright" />
              </div>
              {rows.length === 0 ? (
                <div className="panel px-4 py-5 font-mono text-[11px] text-dim/60">empty</div>
              ) : (
                <div className="space-y-2.5">
                  {rows.map((s) => (
                    <div
                      key={s.id}
                      className="panel flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/app/skill/${s.slug}`}
                            className="font-grot text-sm font-semibold text-[#eaf5ee] hover:text-green"
                          >
                            {s.name}
                          </Link>
                          <SkillStatusBadge status={s.status} />
                        </div>
                        <div className="mt-1 font-mono text-[10px] text-dim">
                          v{s.version} · {s.category} · {s.install_count.toLocaleString()} installs · updated{" "}
                          {relativeTime(s.updated_at)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {actionsFor(s.status).map((a) =>
                          a === "preview" ? (
                            <Link
                              key={a}
                              href={`/app/skill/${s.slug}`}
                              className={btnCls(false)}
                            >
                              {a}
                            </Link>
                          ) : (
                            <button
                              key={a}
                              type="button"
                              onClick={() =>
                                // TODO(server): wire to edit/submit/publish/archive server actions.
                                setFlash(`${a} → ${s.slug} (stub — wire to a server action).`)
                              }
                              className={btnCls(a === "publish to github")}
                            >
                              {a}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function btnCls(solid: boolean) {
  return classNames(
    "border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors",
    solid
      ? "border-green bg-green/10 text-green hover:bg-green hover:text-black"
      : "border-line-bright text-dim hover:border-green/50 hover:text-green",
  );
}
