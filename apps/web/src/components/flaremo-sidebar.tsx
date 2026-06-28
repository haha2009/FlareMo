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
import { useI18n } from "@/i18n";
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
  const { t } = useI18n();

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
          <SidebarGroupLabel>{t("sidebar.navigation")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === "all"} onClick={() => onViewChange("all")}>
                  <InboxIcon />
                  <span>{t("view.timeline")}</span>
                  <Badge className="ml-auto" variant="secondary">
                    {memoCount}
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === "archived"} onClick={() => onViewChange("archived")}>
                  <ArchiveIcon />
                  <span>{t("view.archive")}</span>
                  <Badge className="ml-auto" variant="outline">
                    {archivedCount}
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === "trashed"} onClick={() => onViewChange("trashed")}>
                  <Trash2Icon />
                  <span>{t("view.trash")}</span>
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
