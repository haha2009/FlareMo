import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ArchiveIcon, InboxIcon, SearchIcon, Trash2Icon } from "lucide-react";

export type MemoView = "all" | "archived" | "trashed";

type FlareMoSidebarProps = {
  activeView: MemoView;
  onViewChange: (view: MemoView) => void;
  tags: string[];
  activeTag?: string;
  onTagChange: (tag?: string) => void;
  memoCount: number;
  archivedCount: number;
  trashedCount: number;
};

export function FlareMoSidebar({
  activeView,
  onViewChange,
  tags,
  activeTag,
  onTagChange,
  memoCount,
  archivedCount,
  trashedCount,
}: FlareMoSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex min-w-0 flex-col gap-1 px-2 py-1">
          <div className="truncate font-heading text-lg font-semibold">FlareMo</div>
          <div className="truncate text-xs text-muted-foreground">Cloudflare native memo space</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Views</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === "all"} onClick={() => onViewChange("all")}>
                  <InboxIcon />
                  <span>Timeline</span>
                  <Badge className="ml-auto" variant="secondary">
                    {memoCount}
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === "archived"} onClick={() => onViewChange("archived")}>
                  <ArchiveIcon />
                  <span>Archived</span>
                  <Badge className="ml-auto" variant="outline">
                    {archivedCount}
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === "trashed"} onClick={() => onViewChange("trashed")}>
                  <Trash2Icon />
                  <span>Trash</span>
                  <Badge className="ml-auto" variant="outline">
                    {trashedCount}
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Tags</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={!activeTag} onClick={() => onTagChange(undefined)}>
                  <SearchIcon />
                  <span>All tags</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {tags.map((tag) => (
                <SidebarMenuItem key={tag}>
                  <SidebarMenuButton
                    className={cn(activeTag === tag && "font-medium")}
                    isActive={activeTag === tag}
                    onClick={() => onTagChange(tag)}
                  >
                    <ArchiveIcon />
                    <span>{tag}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
