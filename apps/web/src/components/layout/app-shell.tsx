import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const navigation: Array<{ href: Route; label: string }> = [
  { href: "/dashboard", label: "Overview" },
  { href: "/transfers/new", label: "New transfer" },
  { href: "/credit-assessments/new", label: "Credit request" },
];

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-6xl gap-8 px-6 py-8">
        <aside className="hidden w-64 shrink-0 rounded-[28px] border border-border bg-surface p-6 lg:block">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Customer</p>
            <h1 className="text-2xl font-semibold">Ledger Credit</h1>
          </div>
          <nav className="mt-10 space-y-2">
            {navigation.map((item) => (
              <Link
                className="block rounded-2xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className={cn("flex-1 space-y-6", className)}>{children}</div>
      </div>
    </div>
  );
}
