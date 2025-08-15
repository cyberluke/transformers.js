import * as React from "react";
import { Crown, MessagesSquare, Menu, Plus } from "lucide-react";
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
              href="/subscription" 
              className="p-2 rounded-lg bg-gradient-to-br from-amber-400/20 via-yellow-300/15 to-orange-400/20 backdrop-blur-sm border border-amber-300/30 hover:from-amber-400/30 hover:via-yellow-300/25 hover:to-orange-400/30 hover:border-amber-300/50 transition-all duration-300 shadow-lg shadow-amber-400/10"
              aria-label="Předplatné"
            >
              <Crown className="size-4 text-amber-200" />
            </Link>
          </div>
        ) : (
          // Expanded footer - Subscription link + profile
          <div className="space-y-2 transition-all duration-300 ease-in-out">
            <Link 
              href="/subscription"
              className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-amber-400/15 via-yellow-300/10 to-orange-400/15 backdrop-blur-sm border border-amber-300/25 hover:from-amber-400/25 hover:via-yellow-300/20 hover:to-orange-400/25 hover:border-amber-300/40 transition-all duration-300 shadow-lg shadow-amber-400/5 group"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-400/20 group-hover:from-amber-400/30 group-hover:to-orange-400/30 transition-all duration-300">
                <Crown className="size-4 text-amber-200 group-hover:text-amber-100 transition-colors duration-300" />
              </div>
              <div className="flex flex-col transition-all duration-300 ease-in-out">
                <span className="font-semibold text-amber-100 group-hover:text-white transition-colors duration-300">Předplatné</span>
                <span className="text-amber-200/70 text-sm group-hover:text-amber-100/80 transition-colors duration-300">Upgrade na Pro</span>
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
