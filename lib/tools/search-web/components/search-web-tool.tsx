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
    <div key={index} className="mb-4 rounded-lg border bg-muted/50 p-4">
      {/* Tool Header */}
      <div className="flex items-center gap-2 mb-2">
        <GlobeIcon className="h-4 w-4 text-blue-500" />
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground">
            Vyhledávání na webu
          </div>
          {toolInvocation.args?.query && (
            <div className="text-xs text-muted-foreground mt-0.5">
              "{toolInvocation.args.query}"
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isComplete ? (
            <span className={`text-xs px-2 py-1 rounded-full ${
              isSuccess 
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {isSuccess ? '✅ Dokončeno' : '❌ Chyba'}
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
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