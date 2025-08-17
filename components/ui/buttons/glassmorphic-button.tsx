import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { VariantProps, cva } from "class-variance-authority";

const glassmorphicButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30",
        primary: "bg-emerald-500/20 backdrop-blur-sm text-emerald-300 border border-emerald-400/50 hover:bg-emerald-500/30",
        secondary: "bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 hover:bg-white/20",
        ghost: "text-white/80 hover:bg-white/10 hover:text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-full px-3",
        lg: "h-11 rounded-full px-8",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface GlassmorphicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassmorphicButtonVariants> {}

const GlassmorphicButton = forwardRef<HTMLButtonElement, GlassmorphicButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(glassmorphicButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassmorphicButton.displayName = "GlassmorphicButton"

export { GlassmorphicButton, glassmorphicButtonVariants } 