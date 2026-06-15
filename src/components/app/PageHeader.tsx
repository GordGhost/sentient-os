import { SectionLabel } from "@/components/ui/primitives";

export function PageHeader({
  code,
  title,
  subtitle,
  action,
}: {
  code: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-5 border-b border-line-bright pb-7 md:flex-row md:items-end md:justify-between">
      <div>
        <SectionLabel>{code}</SectionLabel>
        <h1 className="mt-3 font-grot text-3xl font-bold uppercase tracking-tight text-[#eaf5ee] md:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-xl font-mono text-[12px] leading-relaxed text-dim">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
