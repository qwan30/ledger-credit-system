import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const pillars = [
  {
    title: "Customer banking flows",
    description: "Balances, transfer submission, and credit outcomes move through a secure BFF instead of direct browser-to-API calls.",
  },
  {
    title: "Operator accountability",
    description: "Ops, analyst, admin, and auditor views are split by route group and will be wired to explicit role claims.",
  },
  {
    title: "Contract-driven migration",
    description: "UI work is anchored to the frozen OpenAPI contract so the Spring Boot rewrite can replace capability slices safely.",
  },
];

export default function Home() {
  return (
    <main className="grid-sheen min-h-screen">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-14 px-6 py-20">
        <div className="max-w-3xl space-y-6">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Ledger Credit Portal
          </p>
          <h1 className="text-5xl leading-tight font-semibold text-balance sm:text-6xl">
            Incremental customer and operator portal for the Java migration.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            This app is the Next.js BFF shell for the new portal. It stays contract-driven, role-aware, and
            intentionally conservative around finance-sensitive flows.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/login">Open login flow</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard">Open customer shell</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.title}>
              <CardHeader>
                <CardTitle>{pillar.title}</CardTitle>
                <CardDescription>{pillar.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Bootstrap scope in this turn</CardTitle>
            <CardDescription>
              Track 5 foundation is implemented as an app shell, BFF auth/session scaffold, customer route group,
              and typed API client entrypoint.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <p>Auth routes now live under server-side handlers and are ready to proxy the future Java auth endpoints.</p>
            <p>Customer navigation includes dashboard, transfer, and credit entrypoints with placeholder views.</p>
            <p>The UI primitives are intentionally shadcn-style and kept under one ownership zone for later reuse.</p>
            <p>Operator and cutover surfaces remain for the next track once backend parity reaches the needed endpoints.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
