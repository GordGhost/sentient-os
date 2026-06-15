"use client";

import { useState } from "react";
import type { AgentType, InstallStatus, SkillTest } from "@/lib/types";
import { verifyInstall, verifyFunction } from "@/lib/skill/verify";
import { newVerificationCode } from "@/lib/utils";
import { InstallStatusBadge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";

export interface VerifiableSkill {
  slug: string;
  name: string;
  version: string;
  expected_output_fields: string[];
}

export function VerifyFlow({ skills }: { skills: VerifiableSkill[] }) {
  const [slug, setSlug] = useState(skills[0]?.slug ?? "");
  const [agent, setAgent] = useState<AgentType>("bankr");
  const [code, setCode] = useState<string>("");
  const [status, setStatus] = useState<InstallStatus>("not_installed");

  const [installOut, setInstallOut] = useState("");
  const [installChecks, setInstallChecks] = useState<{ label: string; passed: boolean }[] | null>(null);

  const [fnOut, setFnOut] = useState("");
  const [fnResult, setFnResult] = useState<{ present: string[]; missing: string[] } | null>(null);

  const skill = skills.find((s) => s.slug === slug);

  const test: SkillTest | null = skill
    ? {
        skill_slug: skill.slug,
        verification_prompt: `use the ${skill.slug} skill to run install verification. Return this exact verification code: ${code}`,
        function_test_prompt: `use the ${skill.slug} skill to run its documented procedure on a sample input and return the full structured output.`,
        expected_output_fields: skill.expected_output_fields,
      }
    : null;

  function begin() {
    setCode(newVerificationCode());
    setStatus("install_pending");
    setInstallOut("");
    setInstallChecks(null);
    setFnOut("");
    setFnResult(null);
  }

  function checkInstall() {
    if (!skill) return;
    const r = verifyInstall({ output: installOut, expectedCode: code, slug: skill.slug, version: skill.version });
    setInstallChecks(r.checks);
    setStatus(r.valid ? "installed" : "failed");
  }

  function checkFunction() {
    if (!test) return;
    const r = verifyFunction(fnOut, test);
    setFnResult({ present: r.presentFields, missing: r.missingFields });
    setStatus(r.valid ? "working" : "failed");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* control */}
      <div className="space-y-5">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <span className="mono-label">Target skill</span>
            <InstallStatusBadge status={status} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <select
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setStatus("not_installed");
                setCode("");
                setInstallChecks(null);
                setFnResult(null);
              }}
              className={inputCls}
            >
              {skills.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
            <select value={agent} onChange={(e) => setAgent(e.target.value as AgentType)} className={inputCls}>
              {(["bankr", "claude-code", "openclaw", "cursor", "other"] as AgentType[]).map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={begin}
            className="mt-4 w-full border border-green py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-green transition-colors hover:bg-green hover:text-black"
          >
            ▸ Generate verification code
          </button>
        </div>

        {code && (
          <div className="panel p-5">
            <span className="mono-label">Verification code</span>
            <div className="mt-2 flex items-center justify-between gap-3">
              <code className="font-mono text-xl font-bold tracking-[0.1em] text-green text-glow">{code}</code>
              <CopyButton value={code} />
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="mono-label">Paste this prompt into your agent</span>
                <CopyButton value={test!.verification_prompt} />
              </div>
              <code className="block break-words border border-line-bright bg-bg p-3 font-mono text-[11px] leading-relaxed text-cyan">
                {test!.verification_prompt}
              </code>
            </div>
          </div>
        )}
      </div>

      {/* verification I/O */}
      <div className="space-y-5">
        {code ? (
          <>
            <div className="panel p-5">
              <span className="mono-label">Step 1 — paste agent output (install check)</span>
              <textarea
                value={installOut}
                onChange={(e) => setInstallOut(e.target.value)}
                rows={5}
                placeholder='{ "skill": "token-scam-analyzer", "version": "1.0.0", "status": "installed", "verification_code": "ZAPP-VERIFY-..." }'
                className="mt-3 w-full resize-none border border-line-bright bg-bg p-3 font-mono text-[11px] text-txt outline-none placeholder:text-dim/40 focus:border-green/60"
              />
              <button
                type="button"
                onClick={checkInstall}
                disabled={!installOut.trim()}
                className="mt-3 border border-line-bright px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-dim transition-colors hover:border-green/50 hover:text-green disabled:opacity-40"
              >
                Verify install
              </button>
              {installChecks && <CheckList checks={installChecks} />}
            </div>

            {status === "installed" || status === "working" ? (
              <div className="panel p-5">
                <span className="mono-label">Step 2 — function test</span>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-dim">expected fields:</span>
                  <span className="font-mono text-[10px] text-cyan">
                    {skill?.expected_output_fields.join(", ")}
                  </span>
                </div>
                <textarea
                  value={fnOut}
                  onChange={(e) => setFnOut(e.target.value)}
                  rows={5}
                  placeholder="paste the structured output from the function test prompt…"
                  className="mt-3 w-full resize-none border border-line-bright bg-bg p-3 font-mono text-[11px] text-txt outline-none placeholder:text-dim/40 focus:border-green/60"
                />
                <button
                  type="button"
                  onClick={checkFunction}
                  disabled={!fnOut.trim()}
                  className="mt-3 border border-line-bright px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-dim transition-colors hover:border-green/50 hover:text-green disabled:opacity-40"
                >
                  Run function test
                </button>
                {fnResult && (
                  <div className="mt-4 space-y-1.5">
                    {skill?.expected_output_fields.map((f) => {
                      const ok = fnResult.present.includes(f);
                      return (
                        <div key={f} className="flex items-center gap-2 font-mono text-[11px]">
                          <span className={ok ? "text-green" : "text-red"}>{ok ? "✓" : "✕"}</span>
                          <span className={ok ? "text-txt" : "text-red"}>{f}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}

            {status === "working" && (
              <div className="panel border-green/50 bg-green/5 p-5 text-center">
                <div className="font-grot text-lg font-bold text-green text-glow">✓ SKILL VERIFIED — WORKING</div>
                <p className="mt-2 font-mono text-[11px] text-dim">
                  Install + function test both passed. The marketplace can mark this skill Working.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="panel flex h-full min-h-[300px] items-center justify-center p-8 text-center font-mono text-[12px] text-dim">
            Generate a code to begin the install handshake.
          </div>
        )}
      </div>
    </div>
  );
}

function CheckList({ checks }: { checks: { label: string; passed: boolean }[] }) {
  return (
    <div className="mt-4 space-y-1.5">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-2 font-mono text-[11px]">
          <span className={c.passed ? "text-green" : "text-red"}>{c.passed ? "✓" : "✕"}</span>
          <span className={c.passed ? "text-txt" : "text-red"}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

const inputCls =
  "w-full border border-line-bright bg-bg px-3 py-2 font-mono text-[12px] text-txt outline-none focus:border-green/60";
