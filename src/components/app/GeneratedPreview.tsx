import type { GeneratedSkill } from "@/lib/types";
import { Tabs } from "@/components/ui/Tabs";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Badge } from "@/components/ui/Badge";

export function GeneratedPreview({ skill }: { skill: GeneratedSkill }) {
  return (
    <Tabs
      items={[
        { id: "skill", label: "SKILL.md", content: <CodeBlock title="SKILL.md" content={skill.skillMd} /> },
        {
          id: "manifest",
          label: "manifest.json",
          content: <CodeBlock title="manifest.json" content={JSON.stringify(skill.manifest, null, 2)} />,
        },
        {
          id: "test",
          label: "test.json",
          content: <CodeBlock title="test.json" content={JSON.stringify(skill.test, null, 2)} />,
        },
        {
          id: "refs",
          label: "references/examples.md",
          content: <CodeBlock title="references/examples.md" content={skill.referencesMd} />,
        },
        { id: "safety", label: "Safety Review", content: <SafetyReview skill={skill} /> },
      ]}
    />
  );
}

function SafetyReview({ skill }: { skill: GeneratedSkill }) {
  const tone =
    skill.safety.status === "safe" ? "green" : skill.safety.status === "blocked" ? "red" : "amber";
  return (
    <div className="space-y-5">
      <div className="panel p-5">
        <div className="flex items-center justify-between">
          <span className="mono-label">Safety verdict</span>
          <Badge tone={tone as "green" | "amber" | "red"} dot>
            {skill.safety.status.replace(/_/g, " ")}
          </Badge>
        </div>
        <ul className="mt-4 space-y-2">
          {skill.safety.notes.map((n, i) => (
            <li key={i} className="flex gap-2 font-mono text-[11.5px] leading-relaxed text-txt">
              <span className="text-green">▸</span>
              {n}
            </li>
          ))}
        </ul>
        {skill.safety.transformed && (
          <div className="mt-4 border-l-2 border-amber bg-amber/5 px-4 py-3 font-mono text-[11px] leading-relaxed text-amber">
            This skill was rewritten into a safe, analysis-only variant. A human must approve it
            before it can be published.
          </div>
        )}
      </div>

      <div className="panel p-5">
        <span className="mono-label">Validation checks</span>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {skill.validation.checks.map((c, i) => (
            <li
              key={i}
              className="flex items-center gap-2 font-mono text-[11px] tracking-wide"
            >
              <span className={c.passed ? "text-green" : "text-red"}>{c.passed ? "✓" : "✕"}</span>
              <span className={c.passed ? "text-txt" : "text-red"}>{c.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
