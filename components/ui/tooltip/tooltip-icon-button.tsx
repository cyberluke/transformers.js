'use client';

import { ComponentPropsWithoutRef, forwardRef } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './tooltip';
import { GlassmorphicButton } from '@/components/ui/buttons';
import { cn } from '@/lib/utils';

export type TooltipIconButtonProps = ComponentPropsWithoutRef<typeof GlassmorphicButton> & {
  tooltip: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
};

export const TooltipIconButton = forwardRef<
  HTMLButtonElement,
  TooltipIconButtonProps
>(({ children, tooltip, side = 'bottom', className, ...rest }, ref) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <GlassmorphicButton
          variant="ghost"
          size="icon"
          {...rest}
          className={cn('size-6 p-1', className)}
          ref={ref}
        >
          {children}
          <span className="sr-only">{tooltip}</span>
        </GlassmorphicButton>
      </TooltipTrigger>
      <TooltipContent side={side}>{tooltip}</TooltipContent>
    </Tooltip>
  );
});

TooltipIconButton.displayName = 'TooltipIconButton';