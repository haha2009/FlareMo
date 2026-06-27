import { createMemoSchema, listMemosQuerySchema, updateMemoSchema } from "@flaremo/contracts";
import { createMemo, getMemoById, hardDeleteMemo, listMemos, moveMemoToTrash, updateMemo } from "@flaremo/domain";
import { memoToDto, memosToListResponse, parseMemosResourceName } from "@flaremo/memos";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getRequestContext, type HonoBindings } from "../context";
import { jsonError } from "../http";

export const memosApi = new Hono<HonoBindings>();

memosApi.get("/memos", zValidator("query", listMemosQuerySchema), async (c) => {
  try {
    const { db, user } = await getRequestContext(c);
    const result = await listMemos(db, user, c.req.valid("query"));
    return c.json(memosToListResponse({ ...result, user }));
  } catch (error) {
    return jsonError(c, error);
  }
});

memosApi.post("/memos", zValidator("json", createMemoSchema), async (c) => {
  try {
    const { db, user } = await getRequestContext(c);
    const memo = await createMemo(db, user, c.req.valid("json"));
    return c.json(memoToDto(memo, user), 201);
  } catch (error) {
    return jsonError(c, error);
  }
});

memosApi.get("/memos/:id", async (c) => {
  try {
    const { db, user } = await getRequestContext(c);
    const memo = await getMemoById(db, user, parseMemosResourceName(c.req.param("id")));
    return c.json(memoToDto(memo, user));
  } catch (error) {
    return jsonError(c, error);
  }
});

memosApi.patch("/memos/:id", zValidator("json", updateMemoSchema), async (c) => {
  try {
    const { db, user } = await getRequestContext(c);
    const memo = await updateMemo(db, user, parseMemosResourceName(c.req.param("id")), c.req.valid("json"));
    return c.json(memoToDto(memo, user));
  } catch (error) {
    return jsonError(c, error);
  }
});

memosApi.delete("/memos/:id", async (c) => {
  try {
    const { db, user } = await getRequestContext(c);
    const name = parseMemosResourceName(c.req.param("id"));
    if (c.req.query("hard") === "true") {
      await hardDeleteMemo(db, user, name);
      return c.json({ ok: true });
    }
    const memo = await moveMemoToTrash(db, user, name);
    return c.json(memoToDto(memo, user));
  } catch (error) {
    return jsonError(c, error);
  }
});
