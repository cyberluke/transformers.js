"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        // Základní styling
        "relative z-90 overflow-hidden rounded-xl px-3 py-2 text-sm font-medium select-none",
        
        // Glassmorfní efekty s optimalizací GPU
        "bg-white/10 backdrop-blur-md border border-white/20",
        "shadow-lg shadow-black/10 drop-shadow-sm",
        
        // Text styling
        "text-white text-center leading-tight",
        
        // Animace s Tailwind v4.1 utility třídami
        "animate-in fade-in-0 zoom-in-95 duration-200 ease-out",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150",
        
        // Direction-aware slide animace
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2", 
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        
        // Performance optimalizace
        "will-change-[transform,opacity]",
        
        className
      )}
      {...props}
    >
      {children}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Jednoduchý wrapper pro rychlé použití
interface SimpleTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  className?: string
}

const SimpleTooltip = ({ 
  content, 
  children, 
  side = 'top', 
  align = 'center',
  delayDuration = 300,
  className
}: SimpleTooltipProps) => (
  <Tooltip delayDuration={delayDuration}>
    <TooltipTrigger asChild>
      {children}
    </TooltipTrigger>
    <TooltipContent 
      side={side} 
      align={align} 
      className={className}
    >
      {content}
    </TooltipContent>
  </Tooltip>
)

export { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent, 
  TooltipProvider,
  SimpleTooltip,
  type SimpleTooltipProps
}