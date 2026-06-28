import type { CreateShareInput } from "@flaremo/contracts";
import type { FlareMoDb, UserRow } from "@flaremo/db";
import { shares } from "@flaremo/db";
import { and, eq, or } from "drizzle-orm";
import { NotFoundError, ValidationError } from "./errors";
import { createResourceId, createToken, parseResourceName } from "./ids";
import { getMemoById } from "./memos";

export async function createMemoShare(db: FlareMoDb, user: UserRow, memoId: string, input: CreateShareInput = {}) {
  const normalizedMemoId = parseResourceName(memoId, "memos");
  await getMemoById(db, user, normalizedMemoId);
  const expiresAt = input.expires_at ?? null;
  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
    throw new ValidationError("Share expiry must be in the future");
  }

  const now = new Date().toISOString();
  const row = {
    id: createResourceId("shares"),
    memoId: normalizedMemoId,
    userId: user.id,
    token: createToken(),
    expiresAt,
    createdAt: now,
  };

  await db.insert(shares).values(row);
  return getShareByIdOrToken(db, user, row.id);
}

export async function getShareByIdOrToken(db: FlareMoDb, user: UserRow, idOrToken: string) {
  const row = await db.query.shares.findFirst({
    where: and(
      eq(shares.userId, user.id),
      or(eq(shares.id, parseResourceName(idOrToken, "shares")), eq(shares.token, idOrToken)),
    ),
  });

  if (!row) {
    throw new NotFoundError("Share not found");
  }

  if (row.expiresAt && new Date(row.expiresAt).getTime() <= Date.now()) {
    throw new NotFoundError("Share not found");
  }

  return row;
}

export async function listShares(db: FlareMoDb, user: UserRow) {
  return db.select().from(shares).where(eq(shares.userId, user.id));
}
