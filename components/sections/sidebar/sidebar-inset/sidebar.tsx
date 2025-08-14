"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Sidebar({ children, className, ...props }: SidebarProps) {
  const { isOpen, openMobile, setOpenMobile } = useSidebarStore();
  const isMobile = useIsMobile();

  // Mobile sidebar jako Sheet
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent 
          side="left" 
          className="w-80 p-0 bg-black/20 backdrop-blur-xl border-white/10"
        >
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop sidebar - otevřený nebo collapsed (ne úplně zavřený)
  return (
    <div 
      className={cn(
        "sidebar-desktop",
        isOpen ? "sidebar-open" : "sidebar-collapsed",
        className
      )}
      {...props}
    >
      <div className="flex flex-col h-full">
        {children}
      </div>
    </div>
  );
}

export function SidebarHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen } = useSidebarStore();
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={cn(
        "sidebar-header",
        !isMobile && !isOpen && "sidebar-header-collapsed",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen } = useSidebarStore();
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={cn(
        "sidebar-content",
        !isMobile && !isOpen && "sidebar-content-collapsed",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen } = useSidebarStore();
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={cn(
        "sidebar-footer",
        !isMobile && !isOpen && "sidebar-footer-collapsed",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

// Toggle button
export function SidebarToggle({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggleSidebar } = useSidebarStore();
  const isMobile = useIsMobile();

  return (
    <button
      onClick={() => toggleSidebar(isMobile)}
      className={cn(
        "sidebar-toggle",
        className
      )}
      {...props}
    >
      {props.children}
    </button>
  );
}
