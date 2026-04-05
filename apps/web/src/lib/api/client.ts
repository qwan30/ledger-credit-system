import { appEnv } from "@/lib/env";

export async function apiFetch(input: string, init?: RequestInit) {
  const response = await fetch(`${appEnv.JAVA_API_BASE_URL}${input}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  return response;
}
