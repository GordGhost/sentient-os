import { classNames } from "@/lib/utils";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono-label flex items-center gap-2 text-green">
      <span className="h-1.5 w-1.5 bg-green shadow-[0_0_8px_var(--green)]" />
      {children}
    </div>
  );
}

export function Card({
  children,
  className,
  interactive = false,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={classNames(
        "panel corner-frame relative p-5",
        interactive && "transition-colors hover:border-green/50 hover:bg-panel",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Stat({
  value,
  label,
  tone = "green",
  hint,
}: {
  value: React.ReactNode;
  label: string;
  tone?: "green" | "cyan" | "amber" | "red";
  hint?: string;
}) {
  const color =
    tone === "cyan" ? "text-cyan" : tone === "amber" ? "text-amber" : tone === "red" ? "text-red" : "text-green";
  return (
    <Card className="flex flex-col justify-between">
      <div className={classNames("font-grot text-4xl font-bold tabular-nums", color, "text-glow")}>{value}</div>
      <div className="mono-label mt-3">{label}</div>
      {hint && <div className="mt-1 font-mono text-[10px] text-dim/70">{hint}</div>}
    </Card>
  );
}

export function GhostLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={classNames(
        "inline-flex items-center gap-2 border border-green/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-green transition-colors hover:bg-green hover:text-black",
        className,
      )}
    >
      {children}
    </a>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel flex items-center justify-center p-10 font-mono text-[12px] text-dim">
      {children}
    </div>
  );
}
