/**
 * Single-user access password storage.
 *
 * Settings table is keyed by (userId, key). For single-user mode, we use a
 * fixed user id 'users/owner'. The password row lives under key='access_password'.
 */

import { eq, and } from "drizzle-orm";
import { settings, type FlareMoDb } from "@flaremo/db";

export const OWNER_USER_ID = "users/owner";
const KEY = "access_password";

export type AccessPasswordData = {
  hash: string;
  hint?: string;
};

export function hasAccessPassword(data: AccessPasswordData | null | undefined): boolean {
  return !!data && typeof data.hash === "string" && data.hash.startsWith("$s$");
}

export async function getAccessPassword(db: FlareMoDb): Promise<AccessPasswordData | null> {
  const rows = await db
    .select()
    .from(settings)
    .where(and(eq(settings.userId, OWNER_USER_ID), eq(settings.key, KEY)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const value = row.value as { hash?: string; hint?: string } | null;
  if (!value || typeof value.hash !== "string") return null;
  return { hash: value.hash, hint: value.hint };
}

export async function setAccessPassword(
  db: FlareMoDb,
  hash: string,
  hint?: string,
): Promise<void> {
  const value: AccessPasswordData = { hash };
  if (hint) value.hint = hint;
  await db
    .insert(settings)
    .values({
      userId: OWNER_USER_ID,
      key: KEY,
      value,
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: [settings.userId, settings.key],
      set: { value, updatedAt: new Date().toISOString() },
    });
}
