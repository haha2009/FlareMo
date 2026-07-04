import { Hono } from "hono";
import type { HonoBindings } from "../context";
import { hashPassword, verifyPassword } from "../auth/password";
import { createSessionToken, verifySessionToken } from "../auth/jwt";
import {
  getAccessPassword,
  hasAccessPassword,
  setAccessPassword,
  type AccessPasswordData,
} from "@flaremo/domain";

function readCookie(request: Request, name: string): string | null {
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

async function resolveSessionFromCookie(c: import("hono").Context<HonoBindings>): Promise<{ sub: string; email: string } | null> {
  const cookieVal = readCookie(c.req.raw, "flaremo_session");
  if (!cookieVal) return null;
  const secret = (c.env.FLAREMO_JWT_SECRET || "").trim();
  if (!secret || secret === "change-me") return null;
  return verifySessionToken(cookieVal, secret);
}

function isDevSecret(secret: string): boolean {
  return secret === "change-me";
}

const SESSION_COOKIE = "flaremo_session";

export const authRoutes = new Hono<HonoBindings>();

authRoutes.get("/status", async (c) => {
  const userId = c.get("userId");
  if (userId) return c.json({ authenticated: true, hasOwner: true });

  // Try to parse JWT from cookie directly (middleware doesn't parse for public paths)
  const cookieVal = readCookie(c.req.raw, SESSION_COOKIE);
  if (cookieVal) {
    const secret = (c.env.FLAREMO_JWT_SECRET || "").trim();
    if (secret && !isDevSecret(secret)) {
      const payload = await verifySessionToken(cookieVal, secret);
      if (payload) {
        c.set("userId", payload.sub);
        c.set("userEmail", payload.email);
        return c.json({ authenticated: true, hasOwner: true });
      }
    }
  }

  // No valid session — check whether an owner has been configured so the
  // frontend can route first-time visitors to the registration screen.
  const { createDb } = await import("@flaremo/db");
  const db = createDb(c.env.DB);
  const pwData = await getAccessPassword(db);
  const envHash = (c.env.FLAREMO_ACCESS_PASSWORD_HASH || "").trim();
  const hasOwner = hasAccessPassword(pwData) || envHash.length > 0;

  return c.json({ authenticated: false, hasOwner });
});

authRoutes.post("/login", async (c) => {
  const env = c.env;
  const body = await c.req.raw.json().catch(() => null) as { password?: string } | null;
  const password = body?.password;

  if (!password || typeof password !== "string") {
    return c.json({ error: { message: "Password required" } }, 400);
  }

  const secret = (env.FLAREMO_JWT_SECRET || "").trim();
  if (!secret || isDevSecret(secret)) {
    return c.json({ error: { message: "Server not configured" } }, 500);
  }

  const { createDb } = await import("@flaremo/db");
  const db = createDb(c.env.DB);
  const pwData = await getAccessPassword(db);
  const email = env.FLAREMO_SINGLE_USER_EMAIL;

  let expectedHash: string | null = null;
  if (hasAccessPassword(pwData)) {
    expectedHash = pwData!.hash;
  } else {
    expectedHash = (env.FLAREMO_ACCESS_PASSWORD_HASH || "").trim() || null;
  }

  if (!expectedHash) {
    return c.json({ error: { message: "Access not configured" } }, 500);
  }

  const valid = await verifyPassword(password, expectedHash, email);

  if (!valid) {
    return c.json({ error: { message: "Invalid password" } }, 401);
  }

  const token = await createSessionToken({ sub: "users/owner", email }, secret);
  const maxAge = 7 * 24 * 60 * 60;
  const isHttps = new URL(c.req.url).protocol === "https:";
  const secureFlag = isHttps ? "; Secure" : "";
  const cookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secureFlag}`;
  const response = new Response(JSON.stringify({ authenticated: true }), {
    status: 200,
    headers: new Headers({
      "Content-Type": "application/json",
      "Set-Cookie": cookie,
    }),
  });
  return response;
});

authRoutes.post("/logout", async (c) => {
  const isHttps = new URL(c.req.url).protocol === "https:";
  const secureFlag = isHttps ? "; Secure" : "";
  const cookie = `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureFlag}`;
  const response = new Response(JSON.stringify({ authenticated: false }), {
    status: 200,
    headers: new Headers({
      "Content-Type": "application/json",
      "Set-Cookie": cookie,
    }),
  });
  return response;
});

authRoutes.post("/register", async (c) => {
  const env = c.env;
  const body = await c.req.raw.json().catch(() => null) as
    | { name?: string; password?: string; hint?: string }
    | null;

  const name = (body?.name || "").trim();
  const password = body?.password;
  const hint = (body?.hint || "").trim();

  if (!name || !password || typeof password !== "string") {
    return c.json({ error: { message: "Name and password are required" } }, 400);
  }
  if (password.length < 12) {
    return c.json({ error: { message: "Password must be at least 12 characters" } }, 400);
  }

  const secret = (env.FLAREMO_JWT_SECRET || "").trim();
  if (!secret || isDevSecret(secret)) {
    return c.json({ error: { message: "Server not configured" } }, 500);
  }

  const { createDb } = await import("@flaremo/db");
  const { ensureSingleUser } = await import("@flaremo/domain");
  const db = createDb(c.env.DB);

  const existingHash = await getAccessPassword(db);
  if (hasAccessPassword(existingHash)) {
    return c.json({ error: { message: "Access already configured" } }, 409);
  }

  await ensureSingleUser(db, {
    email: env.FLAREMO_SINGLE_USER_EMAIL,
    name,
  });

  const email = env.FLAREMO_SINGLE_USER_EMAIL;
  const hashed = await hashPassword(password, email);
  await setAccessPassword(db, hashed, hint || undefined);

  return c.json({ ok: true });
});

authRoutes.post("/password-hint", async (c) => {
  const { createDb } = await import("@flaremo/db");
  const db = createDb(c.env.DB);
  const pwData = await getAccessPassword(db);

  if (!pwData?.hint) {
    return c.json({ hint: null });
  }

  return c.json({ hint: pwData.hint });
});

authRoutes.post("/change-password", async (c) => {
  const session = await resolveSessionFromCookie(c);
  if (!session) {
    return c.json({ error: { message: "Unauthorized" } }, 401);
  }

  const body = await c.req.raw.json().catch(() => null) as
    | { currentPassword?: string; newPassword?: string }
    | null;

  const currentPassword = body?.currentPassword;
  const newPassword = body?.newPassword;

  if (!currentPassword || !newPassword || typeof newPassword !== "string") {
    return c.json({ error: { message: "Current and new password are required" } }, 400);
  }

  const { createDb } = await import("@flaremo/db");
  const db = createDb(c.env.DB);
  const pwData = (await getAccessPassword(db)) || null;
  const email = c.env.FLAREMO_SINGLE_USER_EMAIL;

  let expectedHash = pwData?.hash || (c.env.FLAREMO_ACCESS_PASSWORD_HASH || "").trim();
  if (!expectedHash) {
    return c.json({ error: { message: "No password set" } }, 500);
  }

  const valid = await verifyPassword(currentPassword, expectedHash, email);
  if (!valid) {
    return c.json({ error: { message: "Current password is incorrect" } }, 401);
  }

  const newHash = await hashPassword(newPassword, email);
  await setAccessPassword(db, newHash, pwData?.hint);

  return c.json({ ok: true });
});
