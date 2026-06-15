"use client";

import { useState } from "react";
import { classNames } from "@/lib/utils";

export function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback for non-secure contexts.
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={classNames(
        "inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors",
        copied
          ? "border-green bg-green text-black"
          : "border-line-bright text-dim hover:border-green/50 hover:text-green",
        className,
      )}
      aria-label={label}
    >
      {copied ? "✓ Copied" : label}
    </button>
  );
}
