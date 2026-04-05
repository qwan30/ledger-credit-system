import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  {
    title: "Balance visibility",
    description: "This screen will read from the Java parity endpoint for account balance and ledger history.",
  },
  {
    title: "Transfer workflow",
    description: "Customer transfer creation will stay behind the BFF and carry Idempotency-Key handling server-side.",
  },
  {
    title: "Credit requests",
    description: "The portal exposes assessment request and detail flows before analyst review surfaces are added.",
  },
];

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Customer portal</p>
        <h1 className="text-4xl font-semibold">Migration dashboard</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          This is the customer foundation route group. It is intentionally thin while the Java parity endpoints are
          being wired in track order.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Placeholder content is deliberate here: the BFF and typed client are ready before live data wiring.
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
