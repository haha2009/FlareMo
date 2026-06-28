import type { Attachment, Memo, MemoVisibility, Share } from "@/api";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n";
import { MemoCard } from "./memo-card";
import { InboxIcon } from "lucide-react";

type MemoListProps = {
  isLoading: boolean;
  memos: Memo[];
  attachmentsByMemo: Map<string, Attachment[]>;
  sharesByMemo: Map<string, Share>;
  onArchive: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onShare: (id: string) => void;
  onUpdate: (id: string, input: { content: string; visibility: MemoVisibility }) => void;
  onTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
};

export function MemoList({
  isLoading,
  memos,
  attachmentsByMemo,
  sharesByMemo,
  onArchive,
  onPin,
  onShare,
  onUpdate,
  onTrash,
  onRestore,
  onHardDelete,
}: MemoListProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
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
          <EmptyTitle>{t("list.emptyTitle")}</EmptyTitle>
          <EmptyDescription>{t("list.emptyDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {memos.map((memo) => (
        <MemoListItem
          attachments={attachmentsByMemo.get(memo.name) ?? []}
          key={memo.name}
          memo={memo}
          share={sharesByMemo.get(memo.name)}
          onArchive={onArchive}
          onHardDelete={onHardDelete}
          onPin={onPin}
          onRestore={onRestore}
          onShare={onShare}
          onTrash={onTrash}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

function MemoListItem({
  memo,
  attachments,
  share,
  onArchive,
  onPin,
  onShare,
  onUpdate,
  onTrash,
  onRestore,
  onHardDelete,
}: Omit<MemoListProps, "isLoading" | "memos" | "attachmentsByMemo" | "sharesByMemo"> & {
  memo: Memo;
  attachments: Attachment[];
  share?: Share;
}) {
  const shareUrl = share ? `${globalThis.location.origin}/share/${share.token}` : undefined;
  return (
    <MemoCard
      attachments={attachments}
      memo={memo}
      share={share}
      shareUrl={shareUrl}
      onArchive={onArchive}
      onHardDelete={onHardDelete}
      onPin={onPin}
      onRestore={onRestore}
      onShare={onShare}
      onTrash={onTrash}
      onUpdate={onUpdate}
    />
  );
}
