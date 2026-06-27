import type { ListMemosResponse, MemoDto } from "@flaremo/contracts";
import type { MemoPayload, MemoRow, UserRow } from "@flaremo/db";

export function memoToDto(memo: MemoRow, user: UserRow): MemoDto {
  return {
    name: memo.id,
    id: memo.id.replace(/^memos\//, ""),
    content: memo.content,
    visibility: memo.visibility,
    state: memo.status,
    pinned: memo.pinned,
    payload: (memo.payload ?? {}) as MemoPayload,
    create_time: memo.createdAt,
    update_time: memo.updatedAt,
    display_time: memo.createdAt,
    creator: user.id,
  };
}

export function memosToListResponse(input: { memos: MemoRow[]; user: UserRow; nextPageToken?: string }): ListMemosResponse {
  return {
    memos: input.memos.map((memo) => memoToDto(memo, input.user)),
    ...(input.nextPageToken ? { next_page_token: input.nextPageToken } : {}),
  };
}

export function parseMemosResourceName(name: string) {
  if (!name.startsWith("memos/")) {
    return `memos/${name}`;
  }
  return name;
}
