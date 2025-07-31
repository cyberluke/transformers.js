'use client';

import { SearchIcon } from "lucide-react";
import { SearchResultItem } from "./search-result-item";

interface SearchResult {
  url: string;
  title: string;
  content: string;
  score: number;
  image: string;
  imgType: 'image' | 'favicon';
}

interface SearchWebResultsProps {
  results: SearchResult[];
  query: string;
}

export function SearchWebResults({ results, query }: SearchWebResultsProps) {
  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
        <SearchIcon className="h-4 w-4" />
        <span>Výsledky pro: "{query}"</span>
      </div>
      
      <div className="grid gap-3">
        {results.slice(0, 3).map((result, idx) => (
          <SearchResultItem key={idx} result={result} index={idx} />
        ))}
      </div>
      
      {results.length > 3 && (
        <div className="text-xs text-white/40 text-center">
          a {results.length - 3} dalších výsledků...
        </div>
      )}
    </div>
  );
} 