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
import { ArchiveIcon, InboxIcon, Trash2Icon } from "lucide-react";

export type MemoView = "all" | "archived" | "trashed";

type FlareMoSidebarProps = {
  activeView: MemoView;
  onViewChange: (view: MemoView) => void;
  memoCount: number;
  archivedCount: number;
  trashedCount: number;
};

export function FlareMoSidebar({
  activeView,
  onViewChange,
  memoCount,
  archivedCount,
  trashedCount,
}: FlareMoSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex min-w-0 items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            F
          </div>
          <div className="truncate font-heading text-lg font-semibold">FlareMo</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>导航</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === "all"} onClick={() => onViewChange("all")}>
                  <InboxIcon />
                  <span>时间线</span>
                  <Badge className="ml-auto" variant="secondary">
                    {memoCount}
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === "archived"} onClick={() => onViewChange("archived")}>
                  <ArchiveIcon />
                  <span>归档</span>
                  <Badge className="ml-auto" variant="outline">
                    {archivedCount}
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === "trashed"} onClick={() => onViewChange("trashed")}>
                  <Trash2Icon />
                  <span>回收站</span>
                  <Badge className="ml-auto" variant="outline">
                    {trashedCount}
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
