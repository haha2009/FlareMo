import type { Attachment, Memo, MemoState, MemoVisibility, Share } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { extractTags, formatMemoTime, getMemoResourceId } from "@/lib/memo";
import { cn } from "@/lib/utils";
import {
  ArchiveIcon,
  CircleIcon,
  DownloadIcon,
  Edit3Icon,
  Globe2Icon,
  LockIcon,
  MoreHorizontalIcon,
  PinIcon,
  RotateCcwIcon,
  Share2Icon,
  ShieldIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";

type MemoCardProps = {
  memo: Memo;
  attachments: Attachment[];
  onArchive: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onShare: (id: string) => void;
  onUpdate: (id: string, input: { content: string; visibility: MemoVisibility }) => void;
  onTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
  share?: Share;
  shareUrl?: string;
};

export function MemoCard({
  memo,
  attachments,
  onArchive,
  onPin,
  onShare,
  onUpdate,
  onTrash,
  onRestore,
  onHardDelete,
  share,
  shareUrl,
}: MemoCardProps) {
  const id = getMemoResourceId(memo);
  const tags = memo.payload.tags ?? extractTags(memo.content);
  const isTrashed = memo.state === "trashed";
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(memo.content);
  const [draftVisibility, setDraftVisibility] = useState<MemoVisibility>(memo.visibility);

  return (
    <article
      className={cn(
        "group relative flex w-full flex-col gap-2 rounded-lg border bg-card px-4 py-3 text-card-foreground transition-colors hover:border-foreground/20",
        memo.pinned && "border-l-4 border-l-primary",
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <button
          className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          type="button"
          onClick={() => onArchive(id)}
        >
          {memo.pinned ? <PinIcon className="text-primary" /> : <CircleIcon className="opacity-40" />}
          <span className="truncate">{formatMemoTime(memo.display_time)}</span>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          {memo.visibility !== "private" && <VisibilityBadge visibility={memo.visibility} />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="操作"
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100"
                size="icon-sm"
                variant="ghost"
              >
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {isTrashed ? (
                  <DropdownMenuItem onClick={() => onRestore(id)}>
                    <RotateCcwIcon />
                    恢复
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit3Icon />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPin(id, !memo.pinned)}>
                      <PinIcon />
                      {memo.pinned ? "取消置顶" : "置顶"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onArchive(id)}>
                      <ArchiveIcon />
                      {memo.state === "archived" ? "移回时间线" : "归档"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onShare(id)}>
                      <Share2Icon />
                      分享
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTrash(id)}>
                      <Trash2Icon />
                      移到回收站
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem variant="destructive" onClick={() => onHardDelete(id)}>
                  <Trash2Icon />
                  彻底删除
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div>
        <div className="whitespace-pre-wrap text-[15px] leading-7">{memo.content}</div>
        {attachments.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {attachments.map((attachment) => (
              <a
                className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                href={attachment.download_url}
                key={attachment.name}
              >
                <DownloadIcon />
                <span className="min-w-0 flex-1 truncate">{attachment.filename}</span>
                <span className="shrink-0 text-xs">{formatBytes(attachment.size)}</span>
              </a>
            ))}
          </div>
        )}
        {share && (
          <div className="mt-3 rounded-md border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            <a className="font-mono hover:text-foreground" href={shareUrl ?? `/share/${share.token}`}>
              {shareUrl ?? `/share/${share.token}`}
            </a>
          </div>
        )}
      </div>
      {(tags.length > 0 || memo.visibility !== "private" || memo.state !== "normal") && (
        <footer className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge className="rounded-md" key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {memo.state !== "normal" && <Badge variant="outline">{stateLabel(memo.state)}</Badge>}
            {memo.visibility === "private" && <VisibilityBadge visibility={memo.visibility} />}
          </div>
        </footer>
      )}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑</DialogTitle>
          </DialogHeader>
          <Textarea
            className="min-h-40 resize-none text-base"
            value={draftContent}
            onChange={(event) => setDraftContent(event.target.value)}
          />
          <ToggleGroup
            type="single"
            value={draftVisibility}
            onValueChange={(value) => {
              if (value) setDraftVisibility(value as MemoVisibility);
            }}
            size="sm"
            variant="outline"
          >
            <ToggleGroupItem value="private">私密</ToggleGroupItem>
            <ToggleGroupItem value="protected">受保护</ToggleGroupItem>
            <ToggleGroupItem value="public">公开</ToggleGroupItem>
          </ToggleGroup>
          <DialogFooter>
            <Button
              disabled={!draftContent.trim()}
              onClick={() => {
                onUpdate(id, { content: draftContent, visibility: draftVisibility });
                setIsEditing(false);
              }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}

export function nextArchiveState(memo: Memo): MemoState {
  return memo.state === "archived" ? "normal" : "archived";
}

function formatBytes(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function VisibilityBadge({ visibility }: { visibility: MemoVisibility }) {
  const icon =
    visibility === "public" ? <Globe2Icon /> : visibility === "protected" ? <ShieldIcon /> : <LockIcon />;
  const label = visibility === "public" ? "公开" : visibility === "protected" ? "受保护" : "私密";
  return (
    <Badge className="rounded-md" variant="outline">
      {icon}
      {label}
    </Badge>
  );
}

function stateLabel(state: MemoState) {
  switch (state) {
    case "archived":
      return "已归档";
    case "trashed":
      return "回收站";
    case "deleted":
      return "已删除";
    default:
      return state;
  }
}
