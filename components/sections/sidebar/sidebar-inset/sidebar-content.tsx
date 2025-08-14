import * as React from "react";
import { Github, MessagesSquare, Menu, Plus } from "lucide-react";
import Link from "next/link";
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarToggle 
} from "./sidebar";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThreadList } from "@/components/new/thread-list";
import { Button } from "@/components/ui/button";

export function AppSidebarContent() {
  const { isOpen } = useSidebarStore();
  const isMobile = useIsMobile();
  const isCollapsed = !isMobile && !isOpen;

  return (
    <Sidebar className="flex flex-col">
      <SidebarHeader>
        {isCollapsed ? (
          // Collapsed header - pouze ikony
          <div className="flex flex-col items-center gap-2 transition-all duration-300 ease-in-out">
            <SidebarToggle 
              aria-label="Rozbalit sidebar"
              className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              <Menu className="size-4 text-white" />
            </SidebarToggle>
          </div>
        ) : (
          // Expanded header - loga + texty
          <div className="flex items-center justify-between transition-all duration-300 ease-in-out">
            <div className="flex items-center gap-3 transition-all duration-300 ease-in-out">
              <div 
                className="sidebar-logo"
                onClick={() => window.open('https://v271.com', '_blank')}
              >
                <MessagesSquare className="size-4" />
              </div>
              <span className="font-semibold text-white transition-all duration-300 ease-in-out">V271</span>
            </div>
            
            <SidebarToggle 
              aria-label="Sbalit sidebar"
            >
             <Menu className="size-4" />
            </SidebarToggle>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        {isCollapsed ? (
          // Collapsed content - jen ikony pro vytvoření chatu
          <div className="flex flex-col items-center gap-3 transition-all duration-300 ease-in-out">
            <Button
              size="icon"
              variant="ghost"
              className="size-8 p-0 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
              aria-label="Nový chat"
            >
              <Plus className="size-4" />
            </Button>
          </div>
        ) : (
          // Expanded content - thread list
          <div className="transition-all duration-300 ease-in-out">
            <ThreadList />
          </div>
        )}
      </SidebarContent>
      
      <SidebarFooter>
        {isCollapsed ? (
          // Collapsed footer - pouze ikony
          <div className="flex flex-col items-center gap-3 transition-all duration-300 ease-in-out">
            <Link 
              href="https://github.com/assistant-ui/assistant-ui" 
              target="_blank"
              className="sidebar-github hover:bg-white/20 transition-all duration-200"
              aria-label="GitHub"
            >
              <Github className="size-4" />
            </Link>
          </div>
        ) : (
          // Expanded footer - GitHub link + profile
          <div className="space-y-2 transition-all duration-300 ease-in-out">
            <Link 
              href="https://github.com/assistant-ui/assistant-ui" 
              target="_blank"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              <div className="sidebar-github">
                <Github className="size-4" />
              </div>
              <div className="flex flex-col transition-all duration-300 ease-in-out">
                <span className="font-semibold text-white">GitHub</span>
                <span className="text-white/70 text-sm">View Source</span>
              </div>
            </Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

// Komponenta pro otevření sidebaru (mobilní tlačítko)
export function SidebarOpenButton() {
  const { setOpenMobile } = useSidebarStore();
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      aria-label="Otevřít postranní panel" 
      className="fixed top-4 left-4 z-50 bg-black/30 backdrop-blur-xl border border-white/20 hover:bg-black/40 shadow-lg text-white md:hidden" 
      onClick={() => setOpenMobile(true)}
    >
      <Menu className="size-6" />
    </Button>
  );
}
