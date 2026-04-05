import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCreditAssessmentPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request credit assessment</CardTitle>
        <CardDescription>
          The customer-side credit flow will submit through the BFF and return the initial under-review state.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Planned inputs: customer identifier and request metadata required by the parity endpoint.
      </CardContent>
    </Card>
  );
}
