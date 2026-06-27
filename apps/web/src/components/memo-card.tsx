import type { Memo } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { extractTags, formatMemoTime, getMemoResourceId } from "@/lib/memo";
import { MoreHorizontalIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";

type MemoCardProps = {
  memo: Memo;
  onTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
};

export function MemoCard({ memo, onTrash, onRestore, onHardDelete }: MemoCardProps) {
  const id = getMemoResourceId(memo);
  const tags = memo.payload.tags ?? extractTags(memo.content);
  const isTrashed = memo.state === "trashed";

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{formatMemoTime(memo.display_time)}</CardTitle>
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
                  <DropdownMenuItem onClick={() => onTrash(id)}>
                    <Trash2Icon />
                    Move to trash
                  </DropdownMenuItem>
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
      </CardContent>
      {(tags.length > 0 || memo.visibility !== "private") && (
        <CardFooter className="flex-wrap gap-2">
          <Badge variant="outline">{memo.visibility}</Badge>
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}
