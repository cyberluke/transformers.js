'use client';

import { GlobeIcon } from "lucide-react";
import { SearchWebResults } from "./search-web-results";

interface SearchWebToolProps {
  toolInvocation: any;
  index: number;
}

export function SearchWebTool({ toolInvocation, index }: SearchWebToolProps) {
  const isComplete = toolInvocation.state === 'result';
  const isSuccess = isComplete && toolInvocation.result?.success;

  return (
    <div key={index} className="mb-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-4 shadow-lg">
      {/* Tool Header */}
      <div className="flex items-center gap-2 mb-2">
        <GlobeIcon className="h-4 w-4 text-blue-400" />
        <div className="flex-1">
          <div className="text-sm font-medium text-white">
            Vyhledávání na webu
          </div>
          {toolInvocation.args?.query && (
            <div className="text-xs text-white/60 mt-0.5">
              "{toolInvocation.args.query}"
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isComplete ? (
            <span className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm ${
              isSuccess 
                ? 'bg-green-400/20 text-green-300 border border-green-400/30'
                : 'bg-red-400/20 text-red-300 border border-red-400/30'
            }`}>
              {isSuccess ? '✅ Dokončeno' : '❌ Chyba'}
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-400/20 backdrop-blur-sm text-blue-300 border border-blue-400/30">
              ⏳ Zpracovávám...
            </span>
          )}
        </div>
      </div>

      {/* Search Web Results */}
      {isSuccess && toolInvocation.result?.result?.results && (
        <SearchWebResults 
          results={toolInvocation.result.result.results}
          query={toolInvocation.result.result.query || toolInvocation.args?.query || ''}
        />
      )}
    </div>
  );
} 