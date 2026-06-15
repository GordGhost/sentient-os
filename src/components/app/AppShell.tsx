"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { classNames } from "@/lib/utils";

const NAV = [
  { href: "/app", label: "Overview", code: "00" },
  { href: "/app/create", label: "Create Skill", code: "01" },
  { href: "/app/marketplace", label: "Marketplace", code: "02" },
  { href: "/app/my-skills", label: "My Skills", code: "03" },
  { href: "/app/verify", label: "Verify Install", code: "04" },
  { href: "/app/admin/review", label: "Admin Review", code: "05" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [clock, setClock] = useState("--:--:--");

  useEffect(() => {
    const t = setInterval(
      () => setClock(new Date().toISOString().slice(11, 19) + " UTC"),
      1000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="scanlines min-h-screen">
      {/* top HUD bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-line-bright bg-bg/90 px-4 py-2.5 backdrop-blur md:px-6">
        <Link href="/app" className="flex items-center gap-2.5 font-mono text-[13px] font-bold tracking-[0.08em] text-green">
          <span className="inline-block h-3 w-3 animate-spin border border-green [animation-duration:6s]" />
          SENTIENT//OS
          <span className="hidden text-dim sm:inline">/ skill-forge</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hudline hidden text-red md:inline">
            <i className="mr-1.5 inline-block h-1.5 w-1.5 animate-blink rounded-full bg-red align-middle shadow-[0_0_6px_var(--green)]" />
            REC
          </span>
          <span className="hudline hidden tabular-nums sm:inline">{clock}</span>
          <a href="/landing.html" className="hudline border border-line-bright px-2.5 py-1 transition-colors hover:border-green/50 hover:text-green">
            ← Exit
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1500px] gap-0 px-0 pt-[46px]">
        {/* sidebar */}
        <aside className="sticky top-[46px] hidden h-[calc(100vh-46px)] w-56 shrink-0 flex-col border-r border-line-bright bg-bg/60 py-6 lg:flex">
          <nav className="flex flex-col gap-0.5 px-3">
            {NAV.map((item) => {
              const active =
                item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={classNames(
                    "group flex items-center gap-3 border-l-2 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
                    active
                      ? "border-green bg-green/5 text-green"
                      : "border-transparent text-dim hover:border-line-bright hover:text-txt",
                  )}
                >
                  <span className="text-[9px] opacity-50">{item.code}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto px-5">
            <div className="hudline leading-relaxed">
              build v0.1.0
              <br />
              mode: <span className="text-amber">mock</span>
              <br />
              net: <span className="text-green">secure</span>
            </div>
          </div>
        </aside>

        {/* mobile nav */}
        <MobileNav pathname={pathname} />

        {/* main */}
        <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-12">{children}</main>
      </div>
    </div>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-line-bright bg-bg/95 backdrop-blur lg:hidden">
      {NAV.map((item) => {
        const active =
          item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={classNames(
              "flex-1 whitespace-nowrap px-3 py-3 text-center font-mono text-[9px] uppercase tracking-[0.1em]",
              active ? "text-green" : "text-dim",
            )}
          >
            {item.label.split(" ")[0]}
          </Link>
        );
      })}
    </div>
  );
}
