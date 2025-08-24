'use client';

import { useState } from 'react';
import { Rabbit, Snail } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip/';

interface SpeedToggleProps {
  isDetailed: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function SpeedToggle({ isDetailed, onToggle, disabled }: SpeedToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  function handleClick() {
    if (disabled) return;
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 200);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={isDetailed ? 'Složitější odpověď' : 'Rychlá odpověď'}
          onClick={handleClick}
          disabled={disabled}
          className="relative flex items-center w-13 h-7 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm transition-colors duration-200 overflow-hidden cursor-pointer disabled:opacity-50"
        >
          <span className="flex items-center justify-center w-1/2 h-full">
            <Rabbit className={`size-4 transition-colors duration-200 ${!isDetailed ? 'text-yellow-400' : 'text-white/50'}`} />
          </span>
          <span className="flex items-center justify-center w-1/2 h-full">
            <Snail className={`size-4 transition-colors duration-200 ${isDetailed ? 'text-blue-400' : 'text-white/50'}`} />
          </span>
          <span
            className={`absolute top-1/2 left-[1px] w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm transition-transform duration-300 -translate-y-1/2 ${isAnimating ? 'backdrop-blur-[1px]' : ''} ${isDetailed ? 'translate-x-6' : 'translate-x-0'}`}
            style={{ pointerEvents: 'none' }}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>
        {isDetailed ? 'Složitější odpověď' : 'Rychlá jednoduchá odpověď'}
      </TooltipContent>
    </Tooltip>
  );
}



