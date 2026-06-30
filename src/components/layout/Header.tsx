"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandWordmark, Logo } from "@/components/layout/Logo";

const navItems = [
  { href: "/kart", label: "Kart", activeClass: "bg-oslo-blue text-white" },
  { href: "/politikk", label: "Politikk", activeClass: "bg-oslo-red text-white" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b-2 border-oslo-border/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5">
          <Logo variant="emblem" size={44} priority className="transition group-hover:scale-105" />
          <BrandWordmark className="text-xl sm:text-2xl" />
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
                    : "text-oslo-ink hover:bg-oslo-blue-light hover:text-oslo-blue",
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
