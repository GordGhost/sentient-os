"use client";

import { useState } from "react";
import type { AgentType, GeneratedSkill, Visibility } from "@/lib/types";
import {
  generateSkillAction,
  publishSkillAction,
  saveDraftAction,
  submitForReviewAction,
} from "@/app/actions";
import { GeneratedPreview } from "./GeneratedPreview";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CopyButton } from "@/components/ui/CopyButton";
import { Badge, SafetyBadge, ValidationBadge } from "@/components/ui/Badge";
import { classNames } from "@/lib/utils";

const AGENTS: { id: AgentType; label: string }[] = [
  { id: "bankr", label: "Bankr" },
  { id: "claude-code", label: "Claude Code" },
  { id: "openclaw", label: "OpenClaw" },
  { id: "cursor", label: "Cursor" },
  { id: "other", label: "Other" },
];

const CATEGORIES = ["crypto", "prediction-markets", "research", "general"];

const EXAMPLES = [
  "analyze a token for scam signals",
  "auto bet on polymarket markets",
  "monitor a wallet and summarize its PnL",
  "research and brief me on a topic with sources",
];

export function CreateSkillForm() {
  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [tools, setTools] = useState("");
  const [agents, setAgents] = useState<AgentType[]>(["bankr", "claude-code", "openclaw"]);
  const [visibility, setVisibility] = useState<Visibility>("public");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedSkill | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  function toggleAgent(a: AgentType) {
    setAgents((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));
  }

  async function onGenerate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setFlash(null);
    try {
      const gen = await generateSkillAction({
        prompt: prompt.trim(),
        name: name.trim() || undefined,
        category: category || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
        required_tools: tools ? tools.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
        compatible_agents: agents.length ? agents : undefined,
        visibility,
        author: "GordGhost",
      });
      setResult(gen);
    } finally {
      setLoading(false);
    }
  }

  async function onPublish() {
    if (!result || publishing) return;
    setPublishing(true);
    try {
      const r = await publishSkillAction(result, "pull_request");
      if (!r.ok) {
        setFlash(r.message);
      } else if (r.mode === "mock") {
        setFlash(`Simulated publish → branch ${r.branch}. Set GITHUB_TOKEN in .env.local to open a real PR.`);
      } else {
        setFlash(`✓ ${r.message} ${r.prUrl ?? ""}`.trim());
      }
    } catch (e) {
      setFlash(`Publish error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setPublishing(false);
    }
  }

  async function onSaveDraft() {
    if (!result) return;
    await saveDraftAction(result);
    setFlash("Saved as draft.");
  }

  async function onSubmitReview() {
    if (!result) return;
    await submitForReviewAction(result);
    setFlash("Submitted for admin review.");
  }

  const blocked = result?.blocked;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      {/* ── input column ── */}
      <div className="space-y-5">
        <div className="panel p-5">
          <label className="mono-label">Your request</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="e.g. analyze a token for scam signals"
            className="mt-3 w-full resize-none border border-line-bright bg-bg px-3 py-3 font-mono text-[13px] text-txt outline-none placeholder:text-dim/50 focus:border-green/60"
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setPrompt(ex)}
                className="border border-line-bright px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-dim transition-colors hover:border-green/40 hover:text-green"
              >
                {ex.slice(0, 28)}
              </button>
            ))}
          </div>
        </div>

        <div className="panel space-y-4 p-5">
          <Field label="Skill name (optional)">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="auto-derived if blank"
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                <option value="">auto-detect</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Visibility">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as Visibility)}
                className={inputCls}
              >
                <option value="public">public</option>
                <option value="private">private</option>
              </select>
            </Field>
          </div>
          <Field label="Tags (comma separated)">
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="crypto, risk" className={inputCls} />
          </Field>
          <Field label="Required tools (comma separated)">
            <input value={tools} onChange={(e) => setTools(e.target.value)} placeholder="token_search, read_contract" className={inputCls} />
          </Field>
          <Field label="Compatible agents">
            <div className="flex flex-wrap gap-1.5">
              {AGENTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAgent(a.id)}
                  className={classNames(
                    "border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors",
                    agents.includes(a.id)
                      ? "border-green bg-green/10 text-green"
                      : "border-line-bright text-dim hover:text-txt",
                  )}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={loading || !prompt.trim()}
          className="relative w-full overflow-hidden border border-green py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-green transition-colors hover:bg-green hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "▸ Generating…" : "▸ Generate Skill"}
        </button>
      </div>

      {/* ── output column ── */}
      <div className="min-w-0">
        {loading && <GeneratingState prompt={prompt} />}

        {!loading && !result && (
          <div className="panel flex h-full min-h-[420px] flex-col items-center justify-center gap-3 p-10 text-center">
            <div className="font-mono text-[13px] text-dim">Awaiting input_</div>
            <p className="max-w-sm font-mono text-[11px] leading-relaxed text-dim/70">
              Describe a skill in one line. The forge writes a full SKILL.md, manifest.json, test.json,
              references, runs a safety review, and validates it before you publish.
            </p>
          </div>
        )}

        {!loading && blocked && (
          <div className="panel border-red/40 p-8">
            <Badge tone="red" dot>Generation Blocked</Badge>
            <h3 className="mt-4 font-grot text-xl text-[#eaf5ee]">Request refused</h3>
            <p className="mt-3 font-mono text-[12px] leading-relaxed text-dim">
              This prompt matches a disallowed category:{" "}
              <span className="text-red">{blocked.reason}</span>. The forge does not generate skills
              that enable phishing, wallet draining, credential theft, or bypassing protections.
            </p>
            <p className="mt-3 font-mono text-[12px] leading-relaxed text-dim">
              Try an analysis-only framing instead — e.g. &quot;analyze token risk&quot; rather than an
              automated execution skill.
            </p>
          </div>
        )}

        {!loading && result && !blocked && (
          <div className="space-y-5">
            {/* header */}
            <div className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">
                    {result.category} · v{result.version}
                  </div>
                  <h2 className="mt-1 font-grot text-2xl font-bold text-[#eaf5ee]">{result.name}</h2>
                  <code className="font-mono text-[11px] text-dim">{result.slug}</code>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <ValidationBadge status={result.validation.status} />
                  <SafetyBadge status={result.safety.status} />
                </div>
              </div>
              <p className="mt-3 font-mono text-[12px] leading-relaxed text-dim">{result.description}</p>
            </div>

            {/* install command */}
            <div className="panel p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="mono-label">Install command</span>
                <CopyButton value={result.installCommand} />
              </div>
              <code className="block break-all font-mono text-[11px] leading-relaxed text-green">
                {result.installCommand}
              </code>
            </div>

            {/* preview tabs */}
            <GeneratedPreview skill={result} />

            {/* verification prompt */}
            <CodeBlock title="install verification prompt" content={result.verificationPrompt} maxHeight="120px" />

            {/* actions */}
            {flash && (
              <div className="panel border-green/40 bg-green/5 px-4 py-3 font-mono text-[11px] text-green">
                {flash}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <ActionBtn onClick={onSaveDraft} variant="ghost">Save Draft</ActionBtn>
              <ActionBtn onClick={onSubmitReview} variant="ghost">Submit for Review</ActionBtn>
              <ActionBtn
                onClick={onPublish}
                variant="solid"
                disabled={publishing || result.safety.status === "needs_manual_review"}
              >
                {publishing ? "Publishing…" : "Publish to GitHub (PR)"}
              </ActionBtn>
            </div>
            {result.safety.status === "needs_manual_review" && (
              <p className="font-mono text-[10px] text-amber">
                Publishing is locked — this skill needs admin approval first (analysis-only rewrite).
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full border border-line-bright bg-bg px-3 py-2 font-mono text-[12px] text-txt outline-none focus:border-green/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mono-label">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function ActionBtn({
  children,
  onClick,
  variant,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: "solid" | "ghost";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        "border px-5 py-3 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        variant === "solid"
          ? "border-green bg-green text-black hover:bg-cyan hover:border-cyan"
          : "border-line-bright text-dim hover:border-green/50 hover:text-green",
      )}
    >
      {children}
    </button>
  );
}

function GeneratingState({ prompt }: { prompt: string }) {
  const lines = [
    "▾ parsing intent…",
    "▾ running safety policy…",
    "▾ selecting category + tools…",
    "▾ authoring SKILL.md…",
    "▾ building manifest.json + test.json…",
    "▾ validating frontmatter + sections…",
  ];
  return (
    <div className="panel p-6">
      <div className="flex items-center gap-2 border-b border-line-bright pb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
        <span className="h-2.5 w-2.5 rounded-full bg-red" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber" />
        <span className="h-2.5 w-2.5 rounded-full bg-green" />
        <span className="ml-2">forge ▸ {prompt.slice(0, 32)}</span>
      </div>
      <div className="mt-4 space-y-2 font-mono text-[12px]">
        {lines.map((l, i) => (
          <div
            key={i}
            className="text-green opacity-0"
            style={{ animation: `fadeIn .4s ease forwards ${i * 0.35}s` }}
          >
            {l} <span className="text-dim">ok</span>
          </div>
        ))}
        <div className="text-cyan">
          <span className="inline-block h-3.5 w-2 animate-blink bg-cyan align-middle" /> compiling…
        </div>
      </div>
      <style>{`@keyframes fadeIn{to{opacity:1}}`}</style>
    </div>
  );
}
