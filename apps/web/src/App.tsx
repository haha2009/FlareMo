import {
  ApiError,
  bindMemoAttachments,
  createMemo,
  createShare,
  exportData,
  getPublicShare,
  hardDeleteMemo,
  importData,
  listMemoAttachments,
  listMemos,
  trashMemo,
  updateMemo,
  uploadAttachment,
  type Share,
} from "@/api";
import { FlareMoSidebar, type MemoView as ViewMode } from "@/components/flaremo-sidebar";
import { MemoComposer } from "@/components/memo-composer";
import { MemoList } from "@/components/memo-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { extractTags, formatMemoTime, getAllTags } from "@/lib/memo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { DownloadIcon, FileIcon, SearchIcon, UploadIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function FlareMoApp() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewMode>("all");
  const [activeTag, setActiveTag] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [sharesByMemo, setSharesByMemo] = useState<Map<string, Share>>(new Map());

  const normalMemosQuery = useQuery({
    queryKey: ["memos", "normal"],
    queryFn: () => listMemos({ state: "normal" }),
  });
  const archivedMemosQuery = useQuery({
    queryKey: ["memos", "archived"],
    queryFn: () => listMemos({ state: "archived" }),
  });
  const trashedMemosQuery = useQuery({
    queryKey: ["memos", "trashed"],
    queryFn: () => listMemos({ state: "trashed", include_deleted: true }),
  });

  const normalMemos = normalMemosQuery.data?.memos ?? [];
  const archivedMemos = archivedMemosQuery.data?.memos ?? [];
  const trashedMemos = trashedMemosQuery.data?.memos ?? [];
  const visibleMemos = useMemo(() => [...normalMemos, ...archivedMemos], [normalMemos, archivedMemos]);
  const attachmentKey = visibleMemos.map((memo) => memo.name).join(",");
  const attachmentsQuery = useQuery({
    enabled: visibleMemos.length > 0,
    queryKey: ["attachments", attachmentKey],
    queryFn: async () => {
      const entries = await Promise.all(
        visibleMemos.map(async (memo) => [memo.name, (await listMemoAttachments(memo.name)).attachments] as const),
      );
      return new Map(entries);
    },
  });

  const invalidateMemos = () => queryClient.invalidateQueries({ queryKey: ["memos"] });
  const invalidateAttachments = () => queryClient.invalidateQueries({ queryKey: ["attachments"] });
  const handleMutationError = (error: Error) => {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      toast.error("Cloudflare Access session required");
      return;
    }
    toast.error(error.message);
  };

  const createMutation = useMutation({
    mutationFn: async (input: {
      content: string;
      visibility: Parameters<typeof createMemo>[0]["visibility"];
      tags: string[];
      files: File[];
    }) => {
      const memo = await createMemo({
        content: input.content || "Untitled attachment",
        visibility: input.visibility,
        payload: { tags: input.tags },
        source: "web",
      });
      if (input.files.length > 0) {
        const attachments = await Promise.all(input.files.map((file) => uploadAttachment({ file, memo: memo.name })));
        await bindMemoAttachments(
          memo.name,
          attachments.map((attachment) => attachment.name),
        );
      }
      return memo;
    },
    onSuccess: () => {
      toast.success("Memo saved");
      void invalidateMemos();
      void invalidateAttachments();
    },
    onError: handleMutationError,
  });

  const trashMutation = useMutation({
    mutationFn: trashMemo,
    onSuccess: () => {
      toast.success("Moved to trash");
      void invalidateMemos();
    },
    onError: handleMutationError,
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => updateMemo(id, { status: "normal" }),
    onSuccess: () => {
      toast.success("Memo restored");
      void invalidateMemos();
    },
    onError: handleMutationError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateMemo>[1] }) => updateMemo(id, input),
    onSuccess: () => {
      toast.success("Memo updated");
      void invalidateMemos();
    },
    onError: handleMutationError,
  });

  const hardDeleteMutation = useMutation({
    mutationFn: hardDeleteMemo,
    onSuccess: () => {
      toast.success("Memo deleted");
      void invalidateMemos();
      void invalidateAttachments();
    },
    onError: handleMutationError,
  });

  const shareMutation = useMutation({
    mutationFn: createShare,
    onSuccess: (share) => {
      setSharesByMemo((current) => new Map(current).set(share.memo, share));
      toast.success("Share created");
    },
    onError: handleMutationError,
  });

  const importMutation = useMutation({
    mutationFn: importData,
    onSuccess: (result) => {
      toast.success(`Imported ${result.imported_memos} memos`);
      void invalidateMemos();
      void invalidateAttachments();
    },
    onError: handleMutationError,
  });

  const allTags = useMemo(() => getAllTags(normalMemos), [normalMemos]);
  const sourceMemos = view === "trashed" ? trashedMemos : view === "archived" ? archivedMemos : normalMemos;
  const filteredMemos = sourceMemos.filter((memo) => {
    const textMatch = query.trim() ? memo.content.toLowerCase().includes(query.trim().toLowerCase()) : true;
    const tagMatch = activeTag ? (memo.payload.tags ?? []).includes(activeTag) : true;
    return textMatch && tagMatch;
  });

  return (
    <TooltipProvider>
      <SidebarProvider>
        <FlareMoSidebar
          activeTag={activeTag}
          activeView={view}
          archivedCount={archivedMemos.length}
          memoCount={normalMemos.length}
          tags={allTags}
          trashedCount={trashedMemos.length}
          onTagChange={setActiveTag}
          onViewChange={setView}
        />
        <SidebarInset>
          <div className="flex min-h-svh flex-col bg-background">
            <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
              <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-2 px-4">
                <SidebarTrigger />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-heading text-base font-semibold">Timeline</div>
                  <div className="truncate text-xs text-muted-foreground">Memos-compatible, Cloudflare-native</div>
                </div>
                <Button
                  aria-label="Export data"
                  size="icon"
                  variant="ghost"
                  onClick={async () => {
                    const bundle = await exportData();
                    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const anchor = document.createElement("a");
                    anchor.href = url;
                    anchor.download = `flaremo-export-${new Date().toISOString()}.json`;
                    anchor.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <DownloadIcon />
                </Button>
                <Button asChild size="icon" variant="ghost">
                  <label aria-label="Import data">
                    <UploadIcon />
                    <Input
                      accept="application/json"
                      className="hidden"
                      type="file"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (!file) return;
                        const text = await file.text();
                        importMutation.mutate(JSON.parse(text) as unknown);
                      }}
                    />
                  </label>
                </Button>
                <div className="relative hidden w-64 md:block">
                  <SearchIcon className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Search memos"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
              </div>
            </header>
            <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-4">
              <div className="relative md:hidden">
                <SearchIcon className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search memos"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              {view === "all" && (
                <MemoComposer
                  isPending={createMutation.isPending}
                  onSubmit={({ content, visibility, tags, files }) =>
                    createMutation.mutate({
                      content,
                      visibility,
                      tags,
                      files,
                    })
                  }
                />
              )}
              <MemoList
                attachmentsByMemo={attachmentsQuery.data ?? new Map()}
                isLoading={normalMemosQuery.isLoading || archivedMemosQuery.isLoading || trashedMemosQuery.isLoading}
                memos={filteredMemos}
                sharesByMemo={sharesByMemo}
                onArchive={(id) => {
                  const memo = visibleMemos.find((item) => item.name === id || item.id === id);
                  updateMutation.mutate({ id, input: { status: memo?.state === "archived" ? "normal" : "archived" } });
                }}
                onHardDelete={(id) => hardDeleteMutation.mutate(id)}
                onPin={(id, pinned) => updateMutation.mutate({ id, input: { pinned } })}
                onRestore={(id) => restoreMutation.mutate(id)}
                onShare={(id) => shareMutation.mutate(id)}
                onTrash={(id) => trashMutation.mutate(id)}
                onUpdate={(id, input) => updateMutation.mutate({ id, input })}
              />
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </TooltipProvider>
  );
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: FlareMoApp,
});

function PublicSharePage() {
  const { token } = shareRoute.useParams();
  const shareQuery = useQuery({
    queryKey: ["public-share", token],
    queryFn: () => getPublicShare(token),
  });
  const share = shareQuery.data;
  const tags = share ? share.memo.payload.tags ?? extractTags(share.memo.content) : [];

  return (
    <div className="min-h-svh bg-background px-4 py-6">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <header className="border-b pb-4">
          <div className="font-heading text-lg font-semibold">FlareMo</div>
          <div className="text-sm text-muted-foreground">Shared memo</div>
        </header>
        {shareQuery.isLoading && <div className="rounded-md border p-6 text-sm text-muted-foreground">Loading...</div>}
        {shareQuery.isError && <div className="rounded-md border p-6 text-sm text-muted-foreground">Share not found.</div>}
        {share && (
          <article className="rounded-md border bg-card p-5 shadow-sm">
            <div className="mb-4 text-sm text-muted-foreground">{formatMemoTime(share.memo.display_time)}</div>
            <div className="whitespace-pre-wrap text-base leading-7">{share.memo.content}</div>
            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground" key={tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {share.attachments.length > 0 && (
              <div className="mt-5 flex flex-col gap-2">
                {share.attachments.map((attachment) => (
                  <a
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                    href={attachment.download_url}
                    key={attachment.name}
                  >
                    <FileIcon />
                    <span className="min-w-0 flex-1 truncate">{attachment.filename}</span>
                  </a>
                ))}
              </div>
            )}
          </article>
        )}
      </main>
    </div>
  );
}

const shareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/share/$token",
  component: PublicSharePage,
});

const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, shareRoute]),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
