
import { cn } from "@/lib/utils"
import { GetResult } from "@fingerprintjs/fingerprintjs-pro";
import Image from "next/image";

interface SidebarInsetProps extends React.ComponentProps<"main"> {
  fingerprintData?: GetResult | null;
}

function SidebarInset({ className, fingerprintData, children, ...props }: SidebarInsetProps) {
  return (
    <main 
      data-slot="sidebar-inset" 
      className={cn(
        "relative flex w-full flex-1 flex-col overflow-hidden",
        className
      )} 
      {...props}
    >
      <header className="relative z-20 flex h-16 shrink-0 items-center gap-2 border-b border-white/10 bg-white/5 px-4 text-white backdrop-blur-md">
        <div className="flex items-center gap-2">
          <p>Dev: {fingerprintData?.visitorId}</p>
        </div>
      </header>
      <div className="relative z-20 flex h-full w-full flex-col box-border">
        {children}
      </div>
    </main>
  );
}

// Alias pro zpětnou kompatibilitu a lepší API
export const SidebarInsetWrapper = SidebarInset;
export { SidebarInset }; 