"use client";

import { useState } from "react";
import { classNames } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function Tabs({ items, initial }: { items: TabItem[]; initial?: string }) {
  const [active, setActive] = useState(initial || items[0]?.id);
  const current = items.find((i) => i.id === active) ?? items[0];

  return (
    <div>
      <div className="flex flex-wrap gap-px border-b border-line-bright bg-line-bright/40">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => setActive(it.id)}
            className={classNames(
              "border-b-2 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors",
              active === it.id
                ? "border-green bg-panel text-green"
                : "border-transparent bg-bg text-dim hover:text-txt",
            )}
          >
            {it.label}
          </button>
        ))}
      </div>
      <div className="pt-4">{current?.content}</div>
    </div>
  );
}
