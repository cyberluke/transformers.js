import * as React from "react";
import { Github, MessagesSquare, Menu, PanelLeftIcon } from "lucide-react";
import Link from "next/link";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { useSidebar } from "./sidebar-provider";
import { ThreadList } from "@/components/new/thread-list";
import { Button } from "@/components/ui/button";
// Styly jsou nyní v CSS jako @layer components

export function AppSidebarContent({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar 
      collapsible="icon"
      className="sidebar-base"
      {...props}
    >
      <SidebarHeader className="sidebar-header">
        <div className="flex items-center justify-between px-1.5 py-1.5">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div 
              className="sidebar-logo"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // V collapsed módu otevři sidebar, v expanded módu jdi na web
                const sidebar = e.currentTarget.closest('[data-state]');
                if (sidebar?.getAttribute('data-state') === 'collapsed') {
                  toggleSidebar();
                } else {
                  window.open('https://v271.com', '_blank');
                }
              }}
            >
              <MessagesSquare className="sidebar-icon-expanded" />
              <PanelLeftIcon className="sidebar-icon-collapsed" />
            </div>
            <span className="sidebar-text">V271</span>
          </div>
          
          {/* Sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Zavřít/Otevřít postranní panel"
            className="sidebar-toggle sidebar-btn sidebar-btn-ghost sidebar-btn-icon"
            onClick={toggleSidebar}
          >
            <PanelLeftIcon className="size-5" />
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="sidebar-content">
        <ThreadList />
      </SidebarContent>
      
      <SidebarRail />
      
      <SidebarFooter className="sidebar-footer">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              asChild
              className="sidebar-menu-btn"
              tooltip="GitHub - View Source"
            >
              <Link href="https://github.com/assistant-ui/assistant-ui" target="_blank">
                <div className="sidebar-github">
                  <Github className="size-4" />
                </div>
                <div className="sidebar-menu-text">
                  <span className="font-semibold text-white">GitHub</span>
                  <span className="text-white/70">View Source</span>
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
    <Button 
      variant="ghost" 
      size="icon" 
      aria-label="Otevřít postranní panel" 
      className="sidebar-mobile-open sidebar-btn sidebar-btn-ghost sidebar-btn-icon" 
      onClick={() => setOpen(true)}
    >
      <Menu className="size-6" />
    </Button>
  );
}
