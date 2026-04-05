import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewTransferPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create transfer</CardTitle>
        <CardDescription>
          This screen is reserved for the customer transfer flow. It will submit to the BFF once the Java transfer
          parity endpoint is available.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Planned inputs: source account, destination, purpose, amount in minor units, and customer confirmation.
      </CardContent>
    </Card>
  );
}
