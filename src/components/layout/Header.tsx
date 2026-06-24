"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hash } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/kart", label: "Kart", activeClass: "bg-summer-turquoise text-white" },
  { href: "/politikk", label: "Politikk", activeClass: "bg-summer-coral text-white" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b-2 border-oslo-border/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-oslo-blue text-white">
            <Hash className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-bold tracking-tight text-oslo-ink sm:text-xl">
              {APP_NAME}
            </span>
            <span className="hidden truncate text-xs font-medium text-oslo-muted sm:block">
              Oslo
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Hovedmeny">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-bold transition",
                  active
                    ? item.activeClass
                    : "text-oslo-ink hover:bg-summer-sky hover:text-oslo-blue",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
