"use client";

import { useMemo, useState } from "react";
import type { AgentType, MarketBadge, Skill } from "@/lib/types";
import { SkillCard } from "./SkillCard";
import { marketBadge, AGENT_LABELS, classNames } from "@/lib/utils";

const STATUS_FILTERS: { id: MarketBadge | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "working", label: "Working" },
  { id: "needs_review", label: "Needs Review" },
  { id: "failed_test", label: "Failed Test" },
  { id: "outdated", label: "Outdated" },
];

export function MarketplaceGrid({ skills }: { skills: Skill[] }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [agent, setAgent] = useState<AgentType | "all">("all");
  const [status, setStatus] = useState<MarketBadge | "all">("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(skills.map((s) => s.category)))],
    [skills],
  );

  const filtered = useMemo(() => {
    return skills.filter((s) => {
      if (category !== "all" && s.category !== category) return false;
      if (agent !== "all" && !s.compatible_agents.includes(agent)) return false;
      if (status !== "all" && marketBadge(s) !== status) return false;
      if (q) {
        const hay = `${s.name} ${s.description} ${s.tags.join(" ")} ${s.slug}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [skills, q, category, agent, status]);

  return (
    <div>
      {/* controls */}
      <div className="panel mb-6 flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[12px] text-green">▸</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search skills, tags, descriptions…"
            className="w-full border border-line-bright bg-bg py-2.5 pl-8 pr-3 font-mono text-[12px] text-txt outline-none placeholder:text-dim/50 focus:border-green/60"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={category} onChange={setCategory} options={categories} prefix="cat" />
          <Select
            value={agent}
            onChange={(v) => setAgent(v as AgentType | "all")}
            options={["all", "bankr", "claude-code", "openclaw", "cursor", "other"]}
            render={(v) => (v === "all" ? "all" : AGENT_LABELS[v as AgentType])}
            prefix="agent"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setStatus(f.id)}
            className={classNames(
              "border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
              status === f.id ? "border-green bg-green/10 text-green" : "border-line-bright text-dim hover:text-txt",
            )}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto self-center font-mono text-[10px] uppercase tracking-[0.12em] text-dim">
          {filtered.length} / {skills.length} skills
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="panel p-10 text-center font-mono text-[12px] text-dim">No skills match your filters.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  render,
  prefix,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  render?: (v: string) => string;
  prefix: string;
}) {
  return (
    <label className="flex items-center gap-2 border border-line-bright bg-bg px-3 py-2">
      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-dim">{prefix}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-bg font-mono text-[11px] text-txt outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{render ? render(o) : o}</option>
        ))}
      </select>
    </label>
  );
}
