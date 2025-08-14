import * as React from "react";
import { cn } from "@/lib/utils";
import { GetResult } from "@fingerprintjs/fingerprintjs-pro";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarOpenButton } from "./sidebar-content";
interface SidebarInsetProps extends React.ComponentProps<"main"> {
  fingerprintData?: GetResult | null;
}

function SidebarInset({ className, fingerprintData, children, ...props }: SidebarInsetProps) {
  const { isOpen } = useSidebarStore();
  const isMobile = useIsMobile();

  return (
    <main 
      className={cn(
        "main-content",
        // Na desktopu posunout content doprava podle stavu sidebaru
        !isMobile && isOpen && "main-content-shifted",
        !isMobile && !isOpen && "main-content-collapsed",
        className
      )} 
      {...props}
    >
      {/* Mobile open button */}
      <SidebarOpenButton />
      
      <header className="sidebar-inset-header relative z-20 flex h-16 shrink-0 items-center gap-2 border-b border-white/10 bg-white/5 px-4 text-white backdrop-blur-md">
        <div className="flex items-center gap-2">
          <p>Dev: {fingerprintData?.visitorId}</p>
        </div>
      </header>
      <div className="sidebar-inset-content relative z-20 flex h-full w-full flex-col box-border">
        {children}
      </div>
    </main>
  );
}

// Alias pro zpětnou kompatibilitu a lepší API
export const SidebarInsetWrapper = SidebarInset;
export { SidebarInset };