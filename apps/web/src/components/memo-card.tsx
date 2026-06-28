import type { Attachment, Memo, MemoState, MemoVisibility, Share } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  ArchiveIcon,
  DownloadIcon,
  Edit3Icon,
  MoreHorizontalIcon,
  PinIcon,
  RotateCcwIcon,
  Share2Icon,
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
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          {memo.pinned && <PinIcon />}
          <span className="truncate">{formatMemoTime(memo.display_time)}</span>
        </CardTitle>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="Memo actions" size="icon-sm" variant="ghost">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {isTrashed ? (
                  <DropdownMenuItem onClick={() => onRestore(id)}>
                    <RotateCcwIcon />
                    Restore
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit3Icon />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPin(id, !memo.pinned)}>
                      <PinIcon />
                      {memo.pinned ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onArchive(id)}>
                      <ArchiveIcon />
                      {memo.state === "archived" ? "Move to timeline" : "Archive"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onShare(id)}>
                      <Share2Icon />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTrash(id)}>
                      <Trash2Icon />
                      Move to trash
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem variant="destructive" onClick={() => onHardDelete(id)}>
                  <Trash2Icon />
                  Delete permanently
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap text-base leading-7">{memo.content}</div>
        {attachments.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {attachments.map((attachment) => (
              <a
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
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
          <div className="mt-4 rounded-md border px-3 py-2 text-xs text-muted-foreground">
            <a className="font-mono hover:text-foreground" href={shareUrl ?? `/share/${share.token}`}>
              {shareUrl ?? `/share/${share.token}`}
            </a>
          </div>
        )}
      </CardContent>
      {(tags.length > 0 || memo.visibility !== "private" || memo.state !== "normal") && (
        <CardFooter className="flex-wrap gap-2">
          <Badge variant="outline">{memo.visibility}</Badge>
          {memo.state !== "normal" && <Badge variant="outline">{memo.state}</Badge>}
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </CardFooter>
      )}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit memo</DialogTitle>
            <DialogDescription>Update the memo content and visibility.</DialogDescription>
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
            <ToggleGroupItem value="private">Private</ToggleGroupItem>
            <ToggleGroupItem value="protected">Protected</ToggleGroupItem>
            <ToggleGroupItem value="public">Public</ToggleGroupItem>
          </ToggleGroup>
          <DialogFooter>
            <Button
              disabled={!draftContent.trim()}
              onClick={() => {
                onUpdate(id, { content: draftContent, visibility: draftVisibility });
                setIsEditing(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
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
