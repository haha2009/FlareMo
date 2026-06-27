export type MemoVisibility = "private" | "protected" | "public";
export type MemoState = "normal" | "archived" | "trashed" | "deleted";

export type MemoPayload = {
  tags?: string[];
  property?: {
    title?: string;
    has_link?: boolean;
    has_task_list?: boolean;
    has_code?: boolean;
    has_incomplete_tasks?: boolean;
  };
  location?: unknown;
  client_id?: string;
  [key: string]: unknown;
};

export type Memo = {
  name: string;
  id: string;
  content: string;
  visibility: MemoVisibility;
  state: MemoState;
  pinned: boolean;
  payload: MemoPayload;
  create_time: string;
  update_time: string;
  display_time: string;
  creator: string;
};

export type ListMemosResponse = {
  memos: Memo[];
  next_page_token?: string;
};

export type CreateMemoRequest = {
  content: string;
  visibility?: MemoVisibility;
  payload?: MemoPayload;
  source?: string;
};

export type UpdateMemoRequest = Partial<{
  content: string;
  visibility: MemoVisibility;
  status: MemoState;
  pinned: boolean;
  payload: MemoPayload;
}>;

export type ListMemoParams = {
  state?: MemoState;
  q?: string;
  tag?: string;
  include_deleted?: boolean;
};

export async function listMemos(params: ListMemoParams = {}) {
  const query = new URLSearchParams();
  query.set("page_size", "50");
  query.set("order_by", "created_at desc");
  if (params.state) query.set("state", params.state);
  if (params.q) query.set("q", params.q);
  if (params.tag) query.set("tag", params.tag);
  if (params.include_deleted) query.set("include_deleted", "true");

  return request<ListMemosResponse>(`/api/app/memos?${query.toString()}`);
}

export async function createMemo(input: CreateMemoRequest) {
  return request<Memo>("/api/app/memos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateMemo(id: string, input: UpdateMemoRequest) {
  return request<Memo>(`/api/app/memos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function trashMemo(id: string) {
  return request<Memo>(`/api/app/memos/${id}`, {
    method: "DELETE",
  });
}

export async function hardDeleteMemo(id: string) {
  return request<{ ok: true }>(`/api/app/memos/${id}?hard=true`, {
    method: "DELETE",
  });
}

async function request<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      message = body.error?.message ?? message;
    } catch {
      // Keep status text.
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}
