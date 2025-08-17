'use client';

import { TooltipProvider, SimpleTooltip, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { GlassmorphicButton } from "@/components/ui/buttons";

export default function TooltipTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Tooltip Test Page
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 place-items-center">
          
          {/* Test 1: SimpleTooltip top */}
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold">SimpleTooltip top</h3>
            <SimpleTooltip 
              content="Toto je SimpleTooltip na top pozici!" 
              side="top"
            >
              <GlassmorphicButton variant="secondary">
                Hover me (Top)
              </GlassmorphicButton>
            </SimpleTooltip>
          </div>

          {/* Test 2: SimpleTooltip bottom */}
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold">SimpleTooltip bottom</h3>
            <SimpleTooltip 
              content="Toto je SimpleTooltip na bottom pozici!" 
              side="bottom"
            >
              <GlassmorphicButton variant="secondary">
                Hover me (Bottom)
              </GlassmorphicButton>
            </SimpleTooltip>
          </div>

          {/* Test 3: Manual Tooltip left */}
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold">Manual Tooltip left</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <GlassmorphicButton variant="secondary">
                  Hover me (Left)
                </GlassmorphicButton>
              </TooltipTrigger>
              <TooltipContent side="left">
                Manual tooltip na left pozici!
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Test 4: Manual Tooltip right */}
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold">Manual Tooltip right</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <GlassmorphicButton variant="secondary">
                  Hover me (Right)
                </GlassmorphicButton>
              </TooltipTrigger>
              <TooltipContent side="right">
                Manual tooltip na right pozici!
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Test 5: Dlouhý text */}
          <div className="space-y-4 text-center col-span-2">
            <h3 className="text-lg font-semibold">Dlouhý text tooltip</h3>
            <SimpleTooltip 
              content="Toto je velmi dlouhý text v tooltip, který testuje, jak se tooltip chová s více textem a jak správně zalamuje řádky." 
              side="top"
              className="max-w-xs"
            >
              <GlassmorphicButton variant="secondary">
                Dlouhý tooltip text
              </GlassmorphicButton>
            </SimpleTooltip>
          </div>

          {/* Test 6: Custom styling */}
          <div className="space-y-4 text-center col-span-2">
            <h3 className="text-lg font-semibold">Custom styled tooltip</h3>
            <SimpleTooltip 
              content="Custom styled tooltip s emerald barvou!" 
              side="bottom"
              className="bg-emerald-500/20 border-emerald-400/50 text-emerald-100"
            >
              <GlassmorphicButton variant="secondary">
                Custom styled
              </GlassmorphicButton>
            </SimpleTooltip>
          </div>

        </div>

        <div className="mt-12 p-6 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
          <h2 className="text-xl font-semibold mb-4">Test Notes:</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• Tooltip komponenty nyní nepoužívají deprecated Arrow prvek</li>
            <li>• Glassmorfní efekt funguje správně na všech pozicích</li>
            <li>• Animace jsou smooth a performance optimalizované</li>
            <li>• Custom styling funguje pomocí className prop</li>
            <li>• Podporovány jsou všechny poziční varianty (top, bottom, left, right)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}