import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(({ checked, onCheckedChange, className, ...props }, ref) => (
  <SwitchPrimitive.Root ref={ref} checked={checked} onCheckedChange={onCheckedChange} className={cn("group inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", "bg-gradient-to-t from-white/30 to-white/5", "radix-state-checked:bg-blue-300/30 radix-state-checked:backdrop-blur-lg radix-state-checked:border-blue-400/40", className)} style={{ boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)" }} {...props}>
    <SwitchPrimitive.Thumb className={cn("pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200", "border border-white/40", "bg-gradient-to-t from-white/80 to-white/40", "radix-state-checked:translate-x-5", "radix-state-unchecked:translate-x-0")} />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";
