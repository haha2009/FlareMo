import type { MemoVisibility } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { extractTags } from "@/lib/memo";
import { Loader2Icon, SendIcon } from "lucide-react";
import { useState } from "react";

type MemoComposerProps = {
  isPending: boolean;
  onSubmit: (input: { content: string; visibility: MemoVisibility; tags: string[] }) => void;
};

export function MemoComposer({ isPending, onSubmit }: MemoComposerProps) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<MemoVisibility>("private");
  const tags = extractTags(content);

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
              if (content.trim()) {
                onSubmit({ content, visibility, tags });
                setContent("");
              }
            }
          }}
        />
      </CardContent>
      <CardFooter className="justify-between gap-3">
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
        <Button
          disabled={isPending || !content.trim()}
          onClick={() => {
            onSubmit({ content, visibility, tags });
            setContent("");
          }}
        >
          {isPending ? <Loader2Icon data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
