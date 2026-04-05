import { cookies } from "next/headers";

import { appEnv } from "@/lib/env";

export interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
}

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export async function readSession(): Promise<SessionState> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(appEnv.SESSION_COOKIE_NAME)?.value;

  if (!raw) {
    return {
      accessToken: null,
      refreshToken: null,
    };
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      accessToken: typeof parsed[ACCESS_KEY] === "string" ? parsed[ACCESS_KEY] : null,
      refreshToken: typeof parsed[REFRESH_KEY] === "string" ? parsed[REFRESH_KEY] : null,
    };
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
    };
  }
}

export async function writeSession(session: SessionState) {
  const cookieStore = await cookies();
  cookieStore.set(
    appEnv.SESSION_COOKIE_NAME,
    JSON.stringify({
      [ACCESS_KEY]: session.accessToken,
      [REFRESH_KEY]: session.refreshToken,
    }),
    {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  );
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(appEnv.SESSION_COOKIE_NAME);
}
