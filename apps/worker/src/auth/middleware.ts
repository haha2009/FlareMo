/**
 * Auth middleware: verify session cookie and stamp context.
 *
 * Public paths are bypassed (defined by isPublicPath).
 */

import type { Context, Next } from "hono";
import type { HonoBindings } from "../context";
import { readCookie } from "../context";
import { verifySessionToken } from "./jwt";

const PUBLIC_PATHS = new Set([
  "/api/auth/status",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/password-hint",
  "/api/public/",
  "/api/v1/health",
  "/openapi.json",
  "/api/v1/openapi.json",
]);

export function isPublicPath(path: string): boolean {
  if (PUBLIC_PATHS.has(path)) return true;
  // /api/public/* (shareable public endpoints)
  if (path.startsWith("/api/public/")) return true;
  return false;
}

export async function authMiddleware(c: Context<HonoBindings>, next: Next) {
  if (isPublicPath(c.req.path)) return next();

  const cookieVal = readCookie(c.req.raw, "flaremo_session");
  if (!cookieVal) return c.json({ error: { message: "Unauthorized" } }, 401);

  const secret = (c.env.FLAREMO_JWT_SECRET || "").trim();
  if (!secret || secret === "change-me") {
    return c.json({ error: { message: "Server not configured" } }, 500);
  }

  const payload = await verifySessionToken(cookieVal, secret);
  if (!payload) return c.json({ error: { message: "Unauthorized" } }, 401);

  c.set("userId", payload.sub);
  c.set("userEmail", payload.email);
  return next();
}
