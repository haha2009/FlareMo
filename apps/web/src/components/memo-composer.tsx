import type { MemoVisibility } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { extractTags } from "@/lib/memo";
import { Loader2Icon, PaperclipIcon, SendIcon, XIcon } from "lucide-react";
import { useState } from "react";

type MemoComposerProps = {
  isPending: boolean;
  onSubmit: (input: { content: string; visibility: MemoVisibility; tags: string[]; files: File[] }) => void;
};

export function MemoComposer({ isPending, onSubmit }: MemoComposerProps) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<MemoVisibility>("private");
  const [files, setFiles] = useState<File[]>([]);
  const tags = extractTags(content);
  const canSubmit = content.trim() || files.length > 0;
  const submit = () => {
    if (!canSubmit) {
      return;
    }
    onSubmit({ content, visibility, tags, files });
    setContent("");
    setFiles([]);
  };

  return (
    <Card>
      <CardContent>
        <Textarea
          aria-label="New memo"
          className="min-h-28 resize-none border-0 px-0 text-base shadow-none focus-visible:ring-0"
          disabled={isPending}
          placeholder="Capture a thought, paste a link, or tag it with #idea..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
        />
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3">
            {files.map((file) => (
              <div
                className="flex max-w-full items-center gap-2 rounded-md border px-2 py-1 text-xs text-muted-foreground"
                key={`${file.name}-${file.lastModified}`}
              >
                <PaperclipIcon />
                <span className="truncate">{file.name}</span>
                <Button
                  aria-label={`Remove ${file.name}`}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                  onClick={() => setFiles((current) => current.filter((item) => item !== file))}
                >
                  <XIcon />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-wrap justify-between gap-3">
        <ToggleGroup
          type="single"
          value={visibility}
          onValueChange={(value) => {
            if (value) setVisibility(value as MemoVisibility);
          }}
          size="sm"
          variant="outline"
        >
          <ToggleGroupItem value="private">Private</ToggleGroupItem>
          <ToggleGroupItem value="protected">Protected</ToggleGroupItem>
          <ToggleGroupItem value="public">Public</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-center gap-2">
          <Button asChild size="icon" variant="outline">
            <label aria-label="Attach files">
              <PaperclipIcon />
              <Input
                className="hidden"
                multiple
                type="file"
                onChange={(event) => {
                  setFiles(Array.from(event.target.files ?? []));
                  event.target.value = "";
                }}
              />
            </label>
          </Button>
          <Button disabled={isPending || !canSubmit} onClick={submit}>
            {isPending ? <Loader2Icon data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
            Save
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
