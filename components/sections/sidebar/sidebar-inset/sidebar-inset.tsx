
import { cn } from "@/lib/utils"
import { GetResult } from "@fingerprintjs/fingerprintjs-pro";
import Image from "next/image";
// Styly jsou nyní v CSS jako @layer components

interface SidebarInsetProps extends React.ComponentProps<"main"> {
  fingerprintData?: GetResult | null;
}

function SidebarInset({ className, fingerprintData, children, ...props }: SidebarInsetProps) {
  return (
    <main 
      data-slot="sidebar-inset" 
      className={cn(
        "sidebar-inset",
        className
      )} 
      {...props}
    >
      <header className="sidebar-inset-header">
        <div className="flex items-center gap-2">
          <p>Dev: {fingerprintData?.visitorId}</p>
        </div>
      </header>
      <div className="sidebar-inset-content">
        {children}
      </div>
    </main>
  );
}

// Alias pro zpětnou kompatibilitu a lepší API
export const SidebarInsetWrapper = SidebarInset;
export { SidebarInset }; 