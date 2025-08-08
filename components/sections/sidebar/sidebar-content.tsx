import * as React from "react";
import { Github, MessagesSquare, Menu, PanelLeftIcon } from "lucide-react";
import Link from "next/link";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, useSidebar } from "@/components/ui/sidebar";
import { ThreadList } from "@/components/new/thread-list";
import { Button } from "@/components/ui/button";

export function AppSidebarContent({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar 
      collapsible="icon"
      className="bg-black/20 backdrop-blur-xl border-r border-white/10 shadow-2xl shadow-black/20"
      {...props}
    >
      <SidebarHeader className="bg-gradient-to-b from-black/30 to-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-1.5 py-1.5">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div 
              className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/80 to-purple-600/80 backdrop-blur-sm text-white shadow-lg transition-all cursor-pointer group-data-[collapsible=icon]:hover:from-gray-500/80 group-data-[collapsible=icon]:hover:to-gray-700/80"
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
              <MessagesSquare className="size-4 group-data-[collapsible=icon]:hidden" />
              <PanelLeftIcon className="size-4 hidden group-data-[collapsible=icon]:block scale-x-[-1]" />
            </div>
            <span className="font-semibold text-white group-data-[collapsible=icon]:hidden">V271</span>
          </div>
          
          {/* Sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Zavřít/Otevřít postranní panel"
            className="text-white/70 hover:text-white hover:bg-white/15 backdrop-blur-sm border border-white/10"
            onClick={toggleSidebar}
          >
            <PanelLeftIcon className="size-5" />
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-gradient-to-b from-black/20 to-black/10 backdrop-blur-sm">
        <ThreadList />
      </SidebarContent>
      
      <SidebarRail />
      
      <SidebarFooter className="bg-gradient-to-t from-black/30 to-black/20 backdrop-blur-sm border-t border-white/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              asChild
              className="hover:bg-white/10 backdrop-blur-sm border border-white/10 group-data-[collapsible=icon]:justify-center"
              tooltip="GitHub - View Source"
            >
              <Link href="https://github.com/assistant-ui/assistant-ui" target="_blank">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-gray-700/80 to-gray-900/80 backdrop-blur-sm text-white shadow-lg">
                  <Github className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
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
      className="fixed top-4 left-4 z-50 bg-black/30 backdrop-blur-xl border border-white/20 hover:bg-black/40 shadow-lg text-white md:hidden" 
      onClick={() => setOpen(true)}
    >
      <Menu className="size-6" />
    </Button>
  );
}
