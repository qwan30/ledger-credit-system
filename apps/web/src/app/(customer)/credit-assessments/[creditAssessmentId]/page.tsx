import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CreditAssessmentDetailPage({
  params,
}: {
  params: Promise<{ creditAssessmentId: string }>;
}) {
  const { creditAssessmentId } = await params;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit assessment detail</CardTitle>
        <CardDescription>Customer-facing assessment detail is scaffolded and ready for typed BFF integration.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Placeholder detail for assessment <span className="font-mono">{creditAssessmentId}</span>.
      </CardContent>
    </Card>
  );
}
