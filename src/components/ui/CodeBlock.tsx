import { CopyButton } from "./CopyButton";

// Terminal-style code/preview panel matching the landing page's terminal aesthetic.
export function CodeBlock({
  title,
  content,
  language,
  maxHeight = "520px",
}: {
  title?: string;
  content: string;
  language?: string;
  maxHeight?: string;
}) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line-bright px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber" />
        <span className="h-2.5 w-2.5 rounded-full bg-green" />
        <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
          {title || language || "output"}
        </span>
        <div className="ml-auto">
          <CopyButton value={content} />
        </div>
      </div>
      <pre
        className="code-scroll overflow-auto bg-[#02050780] p-4 text-txt"
        style={{ maxHeight }}
      >
        {content}
      </pre>
    </div>
  );
}
