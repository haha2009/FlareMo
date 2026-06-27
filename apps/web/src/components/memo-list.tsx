import type { Memo } from "@/api";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { MemoCard } from "./memo-card";
import { InboxIcon } from "lucide-react";

type MemoListProps = {
  isLoading: boolean;
  memos: Memo[];
  onTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
};

export function MemoList({ isLoading, memos, onTrash, onRestore, onHardDelete }: MemoListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (memos.length === 0) {
    return (
      <Empty className="min-h-64">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon />
          </EmptyMedia>
          <EmptyTitle>No memos here</EmptyTitle>
          <EmptyDescription>Capture something above or adjust the current filters.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {memos.map((memo) => (
        <MemoCard
          key={memo.name}
          memo={memo}
          onHardDelete={onHardDelete}
          onRestore={onRestore}
          onTrash={onTrash}
        />
      ))}
    </div>
  );
}
