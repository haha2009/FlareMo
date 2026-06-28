import type { Memo } from "@/api";

export function getMemoResourceId(memo: Memo) {
  return memo.name.replace(/^memos\//, "");
}

export function extractTags(content: string) {
  const tags = new Set<string>();
  for (const match of content.matchAll(/(^|\s)#([\p{L}\p{N}_-]+)/gu)) {
    tags.add(match[2]);
  }
  return [...tags];
}

export function formatMemoTime(value: string, locale?: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getAllTags(memos: Memo[]) {
  const tags = new Set<string>();
  for (const memo of memos) {
    for (const tag of memo.payload.tags ?? extractTags(memo.content)) {
      tags.add(tag);
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}
