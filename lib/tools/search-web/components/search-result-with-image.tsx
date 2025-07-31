'use client';

import { ExternalLinkIcon } from "lucide-react";

interface SearchResult {
  url: string;
  title: string;
  content: string;
  score: number;
  image: string;
  imgType: 'image' | 'favicon';
}

interface SearchResultWithImageProps {
  result: SearchResult;
}

export function SearchResultWithImage({ result }: SearchResultWithImageProps) {
  return (
    <div className="space-y-3">
      <img 
        src={result.image} 
        alt={result.title}
        className="w-full h-32 object-cover rounded-md border border-white/10"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors line-clamp-1">
            {result.title}
          </h4>
          <ExternalLinkIcon className="h-3 w-3 text-white/60 group-hover:text-blue-300 transition-colors" />
        </div>
        <p className="text-xs text-white/70 line-clamp-2 mb-2">
          {result.content}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50">
            {new URL(result.url).hostname}
          </span>
          <span className="text-xs bg-blue-400/20 text-blue-300 px-1.5 py-0.5 rounded backdrop-blur-sm">
            {Math.round(result.score)}%
          </span>
        </div>
      </div>
    </div>
  );
} 