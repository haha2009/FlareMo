import { z } from "zod";

export const memoVisibilitySchema = z.enum(["private", "protected", "public"]);
export const memoStatusSchema = z.enum(["normal", "archived", "trashed", "deleted"]);

export const memoPropertySchema = z
  .object({
    title: z.string().optional(),
    has_link: z.boolean().optional(),
    has_task_list: z.boolean().optional(),
    has_code: z.boolean().optional(),
    has_incomplete_tasks: z.boolean().optional(),
  })
  .passthrough();

export const memoPayloadSchema = z
  .object({
    tags: z.array(z.string()).optional(),
    property: memoPropertySchema.optional(),
    location: z.unknown().optional(),
    client_id: z.string().optional(),
  })
  .passthrough();

export const createMemoSchema = z.object({
  content: z.string().trim().min(1).max(100_000),
  visibility: memoVisibilitySchema.default("private"),
  payload: memoPayloadSchema.optional(),
  source: z.string().trim().min(1).max(64).default("web"),
});

export const updateMemoSchema = z
  .object({
    content: z.string().trim().min(1).max(100_000).optional(),
    visibility: memoVisibilitySchema.optional(),
    status: memoStatusSchema.optional(),
    pinned: z.boolean().optional(),
    payload: memoPayloadSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field must be updated.");

export const listMemosQuerySchema = z.object({
  page_size: z.coerce.number().int().min(1).max(100).default(30),
  page_token: z.string().optional(),
  order_by: z.string().default("created_at desc"),
  state: memoStatusSchema.optional(),
  q: z.string().optional(),
  tag: z.string().optional(),
  include_deleted: z.coerce.boolean().default(false),
});

export const memoDtoSchema = z.object({
  name: z.string(),
  id: z.string(),
  content: z.string(),
  visibility: memoVisibilitySchema,
  state: memoStatusSchema,
  pinned: z.boolean(),
  payload: memoPayloadSchema,
  create_time: z.string(),
  update_time: z.string(),
  display_time: z.string(),
  creator: z.string(),
});

export const listMemosResponseSchema = z.object({
  memos: z.array(memoDtoSchema),
  next_page_token: z.string().optional(),
});

export type CreateMemoInput = z.infer<typeof createMemoSchema>;
export type UpdateMemoInput = z.infer<typeof updateMemoSchema>;
export type ListMemosQuery = z.infer<typeof listMemosQuerySchema>;
export type MemoDto = z.infer<typeof memoDtoSchema>;
export type ListMemosResponse = z.infer<typeof listMemosResponseSchema>;
