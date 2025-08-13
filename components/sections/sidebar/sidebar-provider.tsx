"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip/";
import { 
  useSidebarStore, 
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_MOBILE,
  SIDEBAR_WIDTH_ICON,
  SIDEBAR_KEYBOARD_SHORTCUT
} from "@/lib/stores/sidebar-store";
// Styly jsou nyní v CSS jako @layer components

// Hook pro kompatibilitu s původním API
function useSidebar() {
  const {
    open,
    state,
    openMobile,
    setOpen,
    setOpenMobile,
    toggleSidebar: toggleSidebarAction
  } = useSidebarStore();
  
  const isMobile = useIsMobile();
  
  const toggleSidebar = React.useCallback(() => {
    toggleSidebarAction(isMobile);
  }, [isMobile, toggleSidebarAction]);
  
  return {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar
  };
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const { setOpen, toggleSidebar: toggleSidebarAction } = useSidebarStore();

  // Initialize store with props if provided
  React.useEffect(() => {
    if (openProp !== undefined) {
      setOpen(openProp);
    } else if (defaultOpen !== undefined) {
      setOpen(defaultOpen);
    }
  }, [openProp, defaultOpen, setOpen]);

  // Handle external onOpenChange
  const { open } = useSidebarStore();
  React.useEffect(() => {
    if (setOpenProp && openProp === undefined) {
      setOpenProp(open);
    }
  }, [open, setOpenProp, openProp]);

  // Keyboard shortcut
  const toggleSidebar = React.useCallback(() => {
    toggleSidebarAction(isMobile);
  }, [isMobile, toggleSidebarAction]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <TooltipProvider delayDuration={0}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        className={cn("group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full relative", className)}
        {...props}
      >
        {/* Background image pro celý layout */}
        <div className="sidebar-layout-bg">
          <img
            src="/assets/images/background-beach.jpg"
            alt="Obrázek na pozadí z Unsplash"
            className="sidebar-layout-img"
          />
          <div className="sidebar-layout-overlay" />
        </div>
        <div className="sidebar-layout-content">
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}

export {
  SidebarProvider,
  useSidebar,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_MOBILE,
  SIDEBAR_WIDTH_ICON,
  SIDEBAR_KEYBOARD_SHORTCUT,
}; 