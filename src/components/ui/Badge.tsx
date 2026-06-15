import type {
  InstallStatus,
  MarketBadge,
  SafetyStatus,
  SkillStatus,
  ValidationStatus,
} from "@/lib/types";
import { classNames } from "@/lib/utils";

type Tone = "green" | "cyan" | "amber" | "red" | "dim";

const TONE: Record<Tone, string> = {
  green: "border-green/40 text-green",
  cyan: "border-cyan/40 text-cyan",
  amber: "border-amber/50 text-amber",
  red: "border-red/50 text-red",
  dim: "border-line-bright text-dim",
};

export function Badge({
  children,
  tone = "dim",
  dot = false,
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em]",
        TONE[tone],
        className,
      )}
    >
      {dot && <i className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]" />}
      {children}
    </span>
  );
}

const MARKET_TONE: Record<MarketBadge, { tone: Tone; label: string }> = {
  working: { tone: "green", label: "Working" },
  needs_review: { tone: "amber", label: "Needs Review" },
  failed_test: { tone: "red", label: "Failed Test" },
  outdated: { tone: "dim", label: "Outdated" },
};
export function MarketStatusBadge({ status }: { status: MarketBadge }) {
  const m = MARKET_TONE[status];
  return <Badge tone={m.tone} dot>{m.label}</Badge>;
}

const SKILL_TONE: Record<SkillStatus, { tone: Tone; label: string }> = {
  draft: { tone: "dim", label: "Draft" },
  pending_review: { tone: "amber", label: "Pending Review" },
  published: { tone: "green", label: "Published" },
  rejected: { tone: "red", label: "Rejected" },
  archived: { tone: "dim", label: "Archived" },
};
export function SkillStatusBadge({ status }: { status: SkillStatus }) {
  const m = SKILL_TONE[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

const INSTALL_TONE: Record<InstallStatus, { tone: Tone; label: string }> = {
  not_installed: { tone: "dim", label: "Not Installed" },
  install_pending: { tone: "amber", label: "Install Pending" },
  installed: { tone: "cyan", label: "Installed" },
  working: { tone: "green", label: "Working" },
  failed: { tone: "red", label: "Failed" },
  outdated: { tone: "dim", label: "Outdated" },
  needs_update: { tone: "amber", label: "Needs Update" },
};
export function InstallStatusBadge({ status }: { status: InstallStatus }) {
  const m = INSTALL_TONE[status];
  return <Badge tone={m.tone} dot>{m.label}</Badge>;
}

export function ValidationBadge({ status }: { status: ValidationStatus }) {
  const map: Record<ValidationStatus, Tone> = { pending: "dim", passed: "green", failed: "red" };
  return <Badge tone={map[status]}>{status}</Badge>;
}

export function SafetyBadge({ status }: { status: SafetyStatus }) {
  const map: Record<SafetyStatus, { tone: Tone; label: string }> = {
    safe: { tone: "green", label: "Safe" },
    needs_manual_review: { tone: "amber", label: "Manual Review" },
    blocked: { tone: "red", label: "Blocked" },
  };
  const m = map[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
