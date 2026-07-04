import { createDb } from "@flaremo/db";
import { ensureSingleUser } from "@flaremo/domain";
import type { Context } from "hono";

export type HonoBindings = {
  Bindings: Env;
  Variables: {
    userId?: string;
    userEmail?: string;
  };
};

export type SessionData = {
  userId: string;
  userEmail: string;
};

export function readCookie(request: Request, name: string): string | null {
  const raw = request.headers.get("Cookie");
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key !== name) continue;
    const value = rest.join("=").trim();
    return value ? decodeURIComponent(value) : null;
  }
  return null;
}

export async function getRequestContext(c: Context<HonoBindings>) {
  const db = createDb(c.env.DB);
  const user = await ensureSingleUser(db, {
    email: c.env.FLAREMO_SINGLE_USER_EMAIL,
    name: c.env.FLAREMO_SINGLE_USER_NAME,
  });

  return { db, user };
}
