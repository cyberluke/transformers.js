"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip/";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { useKeyBindings, createKeyBinding } from "@/hooks/useKeyBindings";

function SidebarProvider({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { toggleSidebar } = useSidebarStore();
  const isMobile = useIsMobile();

  // Keyboard shortcuts pomocí useKeyBindings hook (s SSR podporou)
  useKeyBindings({
    bindings: [
      createKeyBinding('b', () => toggleSidebar(isMobile), { 
        ctrlKey: true 
      }),
      createKeyBinding('b', () => toggleSidebar(isMobile), { 
        metaKey: true 
      })
    ],
    deps: [isMobile, toggleSidebar]
  });

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn("flex min-h-svh w-full relative", className)}
        {...props}
      >
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/background-beach.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        
        {/* Main content */}
        <div className="relative z-10 flex min-h-svh w-full">
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}

export { SidebarProvider };
