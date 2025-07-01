import * as React from "react";
import { Github, MessagesSquare, X, Menu } from "lucide-react";
import Link from "next/link";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, useSidebar } from "@/components/ui/sidebar";
import { ThreadList } from "./assistant-ui/thread-list";
import { Button } from "@/components/ui/button";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpen, isMobile } = useSidebar();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between px-1.5 py-1.5">
          <SidebarMenu className="flex-1">
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="https://v271.com" target="_blank">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <MessagesSquare className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">V271</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          {/* Zavírací tlačítko */}
          <Button variant="ghost" size="icon" aria-label="Zavřít postranní panel" className="ml-2 text-muted-foreground hover:bg-white/10" onClick={() => setOpen(false)}>
            <X className="size-5" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ThreadList />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="https://github.com/assistant-ui/assistant-ui" target="_blank">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Github className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">GitHub</span>
                  <span className="">View Source</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// Komponenta pro otevření sidebaru (umísti např. do layoutu)
export function SidebarOpenButton() {
  const { setOpen } = useSidebar();
  return (
    <Button variant="ghost" size="icon" aria-label="Otevřít postranní panel" className="fixed top-4 left-4 z-50 bg-white/10 backdrop-blur hover:bg-white/20 md:hidden" onClick={() => setOpen(true)}>
      <Menu className="size-6" />
    </Button>
  );
}
