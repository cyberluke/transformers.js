"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

function Separator({ className, orientation = "horizontal", decorative = true, ...props }: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return <SeparatorPrimitive.Root data-slot="separator-root" decorative={decorative} orientation={orientation} className={cn("bg-border shrink-0 radix-orientation-horizontal:h-px radix-orientation-horizontal:w-full radix-orientation-vertical:h-full radix-orientation-vertical:w-px", className)} {...props} />;
}

export { Separator };

