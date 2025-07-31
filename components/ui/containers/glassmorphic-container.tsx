import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface GlassmorphicContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'medium' | 'strong';
  border?: boolean;
  shadow?: boolean;
}

const GlassmorphicContainer = forwardRef<
  HTMLDivElement,
  GlassmorphicContainerProps
>(({ className, variant = 'medium', border = true, shadow = true, ...props }, ref) => {
  const variants = {
    light: 'bg-white/5 backdrop-blur-sm',
    medium: 'bg-white/10 backdrop-blur-sm',
    strong: 'bg-white/20 backdrop-blur-md',
  };

  return (
    <div
      ref={ref}
      className={cn(
        variants[variant],
        border && 'border border-white/20',
        shadow && 'shadow-lg',
        'transition-all duration-300',
        className
      )}
      {...props}
    />
  );
});

GlassmorphicContainer.displayName = "GlassmorphicContainer";

export { GlassmorphicContainer }; 