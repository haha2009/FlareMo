import type { Memo } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractTags } from "@/lib/memo";
import { cn } from "@/lib/utils";
import { HashIcon, RotateCcwIcon, SearchIcon } from "lucide-react";

type FlareMoExplorerProps = {
  activeTag?: string;
  memos: Memo[];
  query: string;
  tags: string[];
  onQueryChange: (query: string) => void;
  onTagChange: (tag?: string) => void;
};

export function FlareMoExplorer({
  activeTag,
  memos,
  query,
  tags,
  onQueryChange,
  onTagChange,
}: FlareMoExplorerProps) {
  const stats = getStats(memos);
  const activity = getActivity(memos);
  const hasFilters = Boolean(query.trim() || activeTag);

  return (
    <aside className="hidden xl:flex xl:flex-col xl:gap-4">
      <section className="rounded-lg border bg-card p-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 rounded-lg pl-8"
            placeholder="搜索"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
        {hasFilters && (
          <Button className="mt-2 w-full justify-start" size="sm" variant="ghost" onClick={() => resetFilters(onQueryChange, onTagChange)}>
            <RotateCcwIcon />
            清除筛选
          </Button>
        )}
      </section>

      <section className="rounded-lg border bg-card p-3">
        <div className="mb-3 text-sm font-medium text-muted-foreground">概览</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <StatCell label="记录" value={stats.total} />
          <StatCell label="标签" value={stats.tags} />
          <StatCell label="字数" value={stats.words} />
        </div>
      </section>

      <section className="rounded-lg border bg-card p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-sm font-medium text-muted-foreground">热力图</div>
          <span className="text-xs text-muted-foreground">最近 12 周</span>
        </div>
        <div className="flex gap-1">
          {activity.map((week) => (
            <div className="flex flex-1 flex-col gap-1" key={week.key}>
              {week.days.map((day) => (
                <button
                  aria-label={`${day.date}: ${day.count}`}
                  className={cn("aspect-square rounded-[2px] transition-opacity hover:opacity-80", heatmapColor(day.count))}
                  key={day.date}
                  type="button"
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-card p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-sm font-medium text-muted-foreground">标签</div>
          {activeTag && (
            <Button size="sm" variant="ghost" onClick={() => onTagChange(undefined)}>
              全部
            </Button>
          )}
        </div>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const active = activeTag === tag;
              const count = stats.tagCounts.get(tag) ?? 0;
              return (
                <button
                  className={cn(
                    "inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-muted",
                    active ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground hover:text-foreground",
                  )}
                  key={tag}
                  type="button"
                  onClick={() => onTagChange(active ? undefined : tag)}
                >
                  <HashIcon className="size-3.5 shrink-0" />
                  <span className="truncate">{tag}</span>
                  {count > 1 && (
                    <Badge className="h-4 rounded-md px-1 text-[10px]" variant={active ? "secondary" : "outline"}>
                      {count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">还没有标签</div>
        )}
      </section>
    </aside>
  );
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted/40 px-2 py-3">
      <div className="font-heading text-xl font-semibold tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function getStats(memos: Memo[]) {
  const tagCounts = new Map<string, number>();
  let words = 0;

  for (const memo of memos) {
    const tags = memo.payload.tags ?? extractTags(memo.content);
    for (const tag of tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
    words += memo.content.replace(/#[^\s#]+/g, "").replace(/\s+/g, "").length;
  }

  return {
    tagCounts,
    tags: tagCounts.size,
    total: memos.length,
    words,
  };
}

function getActivity(memos: Memo[]) {
  const counts = new Map<string, number>();
  for (const memo of memos) {
    const key = toDateKey(new Date(memo.display_time));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const today = startOfDay(new Date());
  const start = new Date(today);
  start.setDate(today.getDate() - 83);
  start.setDate(start.getDate() - start.getDay());

  const weeks: Array<{ key: string; days: Array<{ count: number; date: string }> }> = [];
  for (let week = 0; week < 12; week += 1) {
    const days: Array<{ count: number; date: string }> = [];
    for (let day = 0; day < 7; day += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + day);
      const key = toDateKey(date);
      days.push({ date: key, count: counts.get(key) ?? 0 });
    }
    weeks.push({ key: `week-${week}`, days });
  }
  return weeks;
}

function heatmapColor(count: number) {
  if (count <= 0) return "bg-muted";
  if (count === 1) return "bg-emerald-200 dark:bg-emerald-950";
  if (count === 2) return "bg-emerald-300 dark:bg-emerald-800";
  if (count === 3) return "bg-emerald-500 dark:bg-emerald-600";
  return "bg-emerald-700 dark:bg-emerald-400";
}

function resetFilters(onQueryChange: (query: string) => void, onTagChange: (tag?: string) => void) {
  onQueryChange("");
  onTagChange(undefined);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date: Date) {
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
