import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { readSession } from "@/lib/auth/session";

export default async function LoginPage() {
  const session = await readSession();

  if (session.accessToken) {
    redirect("/dashboard");
  }

  return (
    <main className="grid-sheen flex min-h-screen items-center justify-center px-6 py-16">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Portal sign in</CardTitle>
          <CardDescription>
            This is the server-side login entrypoint for the Next.js BFF. It will proxy the Spring Boot auth API as
            that track lands.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/auth/login" className="space-y-4" method="post">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="loginId">
                Login ID
              </label>
              <Input id="loginId" name="loginId" placeholder="customer@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="secret">
                Password
              </label>
              <Input id="secret" name="secret" placeholder="Enter password" type="password" />
            </div>
            <input name="audience" type="hidden" value="customer-api" />
            <input name="grantType" type="hidden" value="password" />
            <Button className="w-full" type="submit">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
