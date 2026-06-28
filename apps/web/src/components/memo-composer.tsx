import type { MemoVisibility } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useI18n } from "@/i18n";
import { extractTags } from "@/lib/memo";
import { Globe2Icon, Loader2Icon, LockIcon, PaperclipIcon, SendIcon, ShieldIcon, XIcon } from "lucide-react";
import { useState } from "react";

type MemoComposerProps = {
  isPending: boolean;
  onSubmit: (input: { content: string; visibility: MemoVisibility; tags: string[]; files: File[] }) => void;
};

export function MemoComposer({ isPending, onSubmit }: MemoComposerProps) {
  const { t } = useI18n();
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
    <section className="group relative flex w-full flex-col gap-2 rounded-lg border bg-card px-4 pt-3 pb-2 shadow-sm">
      <Textarea
        aria-label={t("composer.ariaLabel")}
        className="min-h-28 resize-none border-0 px-0 text-[15px] leading-7 shadow-none focus-visible:ring-0"
        disabled={isPending}
        placeholder={t("composer.placeholder")}
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
        <div className="flex flex-wrap gap-2 border-t pt-2">
          {files.map((file) => (
            <div
              className="flex max-w-full items-center gap-2 rounded-md border bg-muted/30 px-2 py-1 text-xs text-muted-foreground"
              key={`${file.name}-${file.lastModified}`}
            >
              <PaperclipIcon />
              <span className="truncate">{file.name}</span>
              <Button
                aria-label={t("composer.removeFile", { filename: file.name })}
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
      <div className="flex items-center justify-between gap-2 border-t pt-2">
        <div className="flex min-w-0 items-center gap-1">
          <Button asChild size="icon-sm" variant="ghost">
            <label aria-label={t("composer.addAttachment")}>
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
          <ToggleGroup
            type="single"
            value={visibility}
            onValueChange={(value) => {
              if (value) setVisibility(value as MemoVisibility);
            }}
            size="sm"
            variant="outline"
          >
            <ToggleGroupItem aria-label={t("visibility.private")} title={t("visibility.private")} value="private">
              <LockIcon />
              <span className="hidden sm:inline">{t("visibility.private")}</span>
            </ToggleGroupItem>
            <ToggleGroupItem aria-label={t("visibility.protected")} title={t("visibility.protected")} value="protected">
              <ShieldIcon />
              <span className="hidden sm:inline">{t("visibility.protected")}</span>
            </ToggleGroupItem>
            <ToggleGroupItem aria-label={t("visibility.public")} title={t("visibility.public")} value="public">
              <Globe2Icon />
              <span className="hidden sm:inline">{t("visibility.public")}</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex items-center gap-2">
          <Button className="h-7 w-8 px-0 sm:w-auto sm:px-2.5" disabled={isPending || !canSubmit} size="sm" onClick={submit}>
            {isPending ? <Loader2Icon data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
            <span className="hidden sm:inline">{t("common.save")}</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
