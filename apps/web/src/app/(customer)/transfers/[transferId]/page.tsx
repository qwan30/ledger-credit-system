import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TransferDetailPage({
  params,
}: {
  params: Promise<{ transferId: string }>;
}) {
  const { transferId } = await params;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer detail</CardTitle>
        <CardDescription>Typed client wiring will resolve transfer detail by id through the BFF.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Placeholder detail for transfer <span className="font-mono">{transferId}</span>.
      </CardContent>
    </Card>
  );
}
