import { NextResponse } from "next/server";

import { apiFetch } from "@/lib/api/client";
import { writeSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  const formData = await request.formData();
  const payload = {
    audience: String(formData.get("audience") ?? "customer-api"),
    grantType: String(formData.get("grantType") ?? "password"),
    loginId: String(formData.get("loginId") ?? ""),
    secret: String(formData.get("secret") ?? ""),
  };

  try {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL("/login?error=auth", request.url));
    }

    const body = (await response.json()) as {
      data?: { accessToken?: string; refreshToken?: string };
    };

    await writeSession({
      accessToken: body.data?.accessToken ?? null,
      refreshToken: body.data?.refreshToken ?? null,
    });

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch {
    return NextResponse.redirect(new URL("/login?error=unavailable", request.url));
  }
}
